import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase";

type ItemRequisicao = { produtoId: string; quantidade: number };

export async function POST(req: NextRequest) {
  try {
    const { cliente, itens } = (await req.json()) as {
      cliente: { nome: string; email: string };
      itens: ItemRequisicao[];
    };

    if (!cliente?.nome || !cliente?.email || !itens?.length) {
      return NextResponse.json(
        { error: "Dados incompletos para o checkout." },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabase();

    // Busca os produtos reais no banco — nunca confia no preço vindo do client
    const produtoIds = itens.map((i) => i.produtoId);
    const { data: produtos, error: erroProdutos } = await supabase
      .from("produtos")
      .select("*")
      .in("id", produtoIds);

    if (erroProdutos || !produtos?.length) {
      return NextResponse.json(
        { error: "Produtos não encontrados." },
        { status: 400 }
      );
    }

    const itensPedido = itens.map((i) => {
      const produto = produtos.find((p) => p.id === i.produtoId)!;
      return {
        produto_id: produto.id,
        nome: produto.nome,
        quantidade: i.quantidade,
        preco_unitario_centavos: produto.preco_centavos,
        fornecedor_sku: produto.fornecedor_sku,
      };
    });

    const totalCentavos = itensPedido.reduce(
      (soma, i) => soma + i.preco_unitario_centavos * i.quantidade,
      0
    );

    // 1. Cria o pedido no Supabase com status "aguardando_pagamento"
    const { data: pedido, error: erroPedido } = await supabase
      .from("pedidos")
      .insert({
        cliente_nome: cliente.nome,
        cliente_email: cliente.email,
        itens: itensPedido,
        total_centavos: totalCentavos,
        status: "aguardando_pagamento",
      })
      .select()
      .single();

    if (erroPedido || !pedido) {
      return NextResponse.json(
        { error: "Não foi possível criar o pedido." },
        { status: 500 }
      );
    }

    // 2. Cria a preferência de pagamento no Mercado Pago
    const mpResponse = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: itensPedido.map((i) => ({
            title: i.nome,
            quantity: i.quantidade,
            unit_price: i.preco_unitario_centavos / 100,
            currency_id: "BRL",
          })),
          payer: { name: cliente.nome, email: cliente.email },
          external_reference: pedido.id,
          notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/sucesso`,
            failure: `${process.env.NEXT_PUBLIC_SITE_URL}/carrinho`,
            pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pedido/sucesso`,
          },
          auto_return: "approved",
        }),
      }
    );

    if (!mpResponse.ok) {
      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento no Mercado Pago." },
        { status: 502 }
      );
    }

    const preferencia = await mpResponse.json();

    // Guarda o id da preferência para conseguir rastrear o pedido depois
    await supabase
      .from("pedidos")
      .update({ mercado_pago_preference_id: preferencia.id })
      .eq("id", pedido.id);

    return NextResponse.json({ checkoutUrl: preferencia.init_point });
  } catch (err) {
    console.error("Erro no checkout:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao processar o checkout." },
      { status: 500 }
    );
  }
}
