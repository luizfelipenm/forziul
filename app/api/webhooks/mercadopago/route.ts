import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase";
import { criarPedidoNoFornecedor } from "@/lib/fornecedor";
import { enviarWhatsApp } from "@/lib/notificacoes";

/**
 * Webhook chamado pelo Mercado Pago sempre que o status de um pagamento muda.
 * Fluxo:
 *   1. Recebe a notificação e busca os detalhes reais do pagamento na API do MP
 *      (nunca confia cegamente no payload recebido)
 *   2. Se aprovado, marca o pedido como "pago" no Supabase
 *   3. Cria o pedido de fulfillment automaticamente no fornecedor (CJ Dropshipping)
 *   4. Te avisa no WhatsApp via Z-API, com sucesso ou erro
 */
export async function POST(req: NextRequest) {
  const supabase = createServiceSupabase();

  try {
    const body = await req.json();
    const paymentId = body?.data?.id;

    if (!paymentId) {
      // Mercado Pago também manda pings de teste sem payment id — apenas confirma recebimento
      return NextResponse.json({ ok: true });
    }

    // Busca o pagamento real na API do Mercado Pago (fonte da verdade)
    const mpResp = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!mpResp.ok) {
      return NextResponse.json({ ok: true }); // MP não deve receber erro/retry infinito
    }

    const pagamento = await mpResp.json();
    const pedidoId = pagamento.external_reference;

    if (!pedidoId || pagamento.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    // Busca o pedido correspondente
    const { data: pedido, error: erroPedido } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", pedidoId)
      .single();

    if (erroPedido || !pedido) {
      return NextResponse.json({ ok: true });
    }

    // Evita processar duas vezes o mesmo pedido (Mercado Pago pode reenviar o webhook)
    if (pedido.status !== "aguardando_pagamento") {
      return NextResponse.json({ ok: true });
    }

    // 1. Marca como pago
    await supabase
      .from("pedidos")
      .update({
        status: "pago",
        mercado_pago_payment_id: String(paymentId),
      })
      .eq("id", pedido.id);

    // 2. Aciona o fornecedor automaticamente
    const resultadoFornecedor = await criarPedidoNoFornecedor(
      pedido,
      pedido.itens.map((i: { fornecedor_sku: string; quantidade: number }) => ({
        fornecedor_sku: i.fornecedor_sku,
        quantidade: i.quantidade,
      })),
      {
        nome: pedido.cliente_nome,
        telefone: pedido.cliente_telefone ?? "",
        endereco: pedido.endereco_rua ?? "",
        cidade: pedido.endereco_cidade ?? "",
        estado: pedido.endereco_estado ?? "",
        cep: pedido.endereco_cep ?? "",
      }
    );

    if (resultadoFornecedor.sucesso) {
      await supabase
        .from("pedidos")
        .update({
          status: "enviado_ao_fornecedor",
          fornecedor_pedido_id: resultadoFornecedor.idPedidoFornecedor,
        })
        .eq("id", pedido.id);

      await enviarWhatsApp(
        `✅ Pedido #${pedido.id} pago e enviado ao fornecedor automaticamente.\nCliente: ${pedido.cliente_nome}\nTotal: R$ ${(pedido.total_centavos / 100).toFixed(2)}`
      );
    } else {
      // Pagamento OK, mas falhou o envio ao fornecedor — precisa de atenção manual
      await supabase
        .from("pedidos")
        .update({ status: "erro_fornecedor" })
        .eq("id", pedido.id);

      await enviarWhatsApp(
        `⚠️ Pedido #${pedido.id} foi PAGO mas falhou ao criar no fornecedor.\nErro: ${resultadoFornecedor.erro}\nAção manual necessária.`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook do Mercado Pago:", err);
    // Sempre responde 200 pro MP não ficar reenviando indefinidamente em loop de erro
    return NextResponse.json({ ok: true });
  }
}
