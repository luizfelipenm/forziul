export type Produto = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco_centavos: number;
  imagem_url: string | null;
  estoque: number;
  fornecedor_sku: string; // SKU do produto no fornecedor (ex: CJ Dropshipping)
  ativo: boolean;
};

export type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
};

export type StatusPedido =
  | "aguardando_pagamento"
  | "pago"
  | "enviado_ao_fornecedor"
  | "erro_fornecedor"
  | "em_transporte"
  | "entregue"
  | "cancelado";

export type ItemPedido = {
  produto_id: string;
  nome: string;
  quantidade: number;
  preco_unitario_centavos: number;
  fornecedor_sku: string;
};

export type Pedido = {
  id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string | null;
  endereco_rua: string | null;
  endereco_cidade: string | null;
  endereco_estado: string | null;
  endereco_cep: string | null;
  itens: ItemPedido[];
  total_centavos: number;
  status: StatusPedido;
  mercado_pago_preference_id: string | null;
  mercado_pago_payment_id: string | null;
  fornecedor_pedido_id: string | null;
  criado_em: string;
};

export function formatarPreco(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
