-- ============================================================
-- Forziul — schema inicial do Supabase
-- Rode este arquivo em: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabela: produtos
-- ------------------------------------------------------------
create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  preco_centavos integer not null check (preco_centavos >= 0),
  imagem_url text,
  estoque integer not null default 0,
  fornecedor_sku text not null, -- SKU/VID do produto na CJ Dropshipping
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table produtos enable row level security;

-- Qualquer pessoa (anônima) pode LER produtos ativos — necessário pra vitrine funcionar
create policy "Produtos ativos são públicos"
  on produtos for select
  using (ativo = true);

-- Ninguém além do service role pode inserir/editar/excluir produtos direto do client
-- (cadastro de produtos deve ser feito via Supabase Studio ou uma rota autenticada de admin)

-- ------------------------------------------------------------
-- Tabela: pedidos
-- ------------------------------------------------------------
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_nome text not null,
  cliente_email text not null,
  cliente_telefone text,
  endereco_rua text,
  endereco_cidade text,
  endereco_estado text,
  endereco_cep text,
  itens jsonb not null, -- snapshot dos itens no momento da compra (nome, preço, sku, qtd)
  total_centavos integer not null check (total_centavos >= 0),
  status text not null default 'aguardando_pagamento'
    check (status in (
      'aguardando_pagamento',
      'pago',
      'enviado_ao_fornecedor',
      'erro_fornecedor',
      'em_transporte',
      'entregue',
      'cancelado'
    )),
  mercado_pago_preference_id text,
  mercado_pago_payment_id text,
  fornecedor_pedido_id text,
  criado_em timestamptz not null default now()
);

alter table pedidos enable row level security;

-- Pedidos NÃO são legíveis/graváveis pelo client anônimo.
-- Toda a criação e atualização de pedidos passa pelas rotas de servidor
-- (/api/checkout e /api/webhooks/mercadopago), que usam a service role key
-- e portanto ignoram RLS. Isso protege dados de clientes e status de pagamento.
-- Nenhuma policy de select/insert é criada de propósito aqui.

-- ------------------------------------------------------------
-- Índices úteis
-- ------------------------------------------------------------
create index if not exists idx_pedidos_status on pedidos (status);
create index if not exists idx_produtos_slug on produtos (slug);

-- ------------------------------------------------------------
-- Dado de exemplo (opcional — remova em produção)
-- ------------------------------------------------------------
-- insert into produtos (nome, slug, descricao, preco_centavos, estoque, fornecedor_sku)
-- values ('Fone Bluetooth XYZ', 'fone-bluetooth-xyz', 'Fone sem fio com cancelamento de ruído.', 14990, 25, 'CJ-SKU-0001');
