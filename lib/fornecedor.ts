import { Pedido } from "./types";

type ItemPedidoFornecedor = {
  fornecedor_sku: string;
  quantidade: number;
};

/**
 * Cria o pedido de envio (fulfillment) na CJ Dropshipping assim que o
 * pagamento é confirmado. Isso avisa automaticamente o fornecedor de
 * que ele precisa separar e enviar os produtos.
 *
 * ATENÇÃO: os nomes de endpoint/campos abaixo seguem a estrutura geral
 * da API de "Create Order" da CJ Dropshipping — confirme o endpoint e o
 * payload exatos na documentação oficial da sua conta (a CJ versiona a
 * API e pode variar por conta/região), e ajuste aqui antes de ir pra produção.
 * Doc: https://developers.cjdropshipping.com
 */
export async function criarPedidoNoFornecedor(
  pedido: Pedido,
  itens: ItemPedidoFornecedor[],
  endereco: {
    nome: string;
    telefone: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
  }
): Promise<{ sucesso: boolean; idPedidoFornecedor?: string; erro?: string }> {
  const apiKey = process.env.CJ_DROPSHIPPING_API_KEY;

  if (!apiKey) {
    return { sucesso: false, erro: "CJ_DROPSHIPPING_API_KEY não configurada." };
  }

  try {
    const resp = await fetch("https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CJ-Access-Token": apiKey,
      },
      body: JSON.stringify({
        orderNumber: pedido.id,
        shippingCountryCode: "BR",
        shippingProvince: endereco.estado,
        shippingCity: endereco.cidade,
        shippingAddress: endereco.endereco,
        shippingZip: endereco.cep,
        shippingCustomerName: endereco.nome,
        shippingPhone: endereco.telefone,
        products: itens.map((i) => ({
          vid: i.fornecedor_sku,
          quantity: i.quantidade,
        })),
      }),
    });

    const data = await resp.json();

    if (!resp.ok || data.code !== 200) {
      return { sucesso: false, erro: data.message ?? "Erro desconhecido na API da CJ." };
    }

    return { sucesso: true, idPedidoFornecedor: data.data?.orderId };
  } catch (err) {
    return { sucesso: false, erro: String(err) };
  }
}
