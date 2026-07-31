# Forziul

Loja de eletrônicos em dropshipping. Next.js + Supabase + Mercado Pago + CJ Dropshipping + Z-API.

## Como o fluxo de automação funciona

```
Cliente finaliza compra (/carrinho)
  → POST /api/checkout cria o pedido no Supabase e a preferência no Mercado Pago
  → Cliente paga na página do Mercado Pago
  → Mercado Pago chama POST /api/webhooks/mercadopago
      → confirma o pagamento na API do MP (fonte da verdade)
      → marca o pedido como "pago" no Supabase
      → cria o pedido de envio automaticamente na CJ Dropshipping
      → te avisa no WhatsApp via Z-API (sucesso ou erro)
```

## 1. Rodar localmente

```bash
npm install
cp .env.example .env.local
```

Preencha o `.env.local` com as chaves reais (veja a seção "Onde conseguir cada chave" abaixo).

```bash
npm run dev
```

Acesse http://localhost:3000

## 2. Criar as tabelas no Supabase

1. Abra seu projeto em supabase.com/dashboard
2. Vá em **SQL Editor** → **New query**
3. Cole o conteúdo de `supabase/schema.sql` e clique em **Run**

Isso cria as tabelas `produtos` e `pedidos`, já com RLS configurado (produtos são públicos para leitura; pedidos só são acessíveis pelas rotas de servidor, nunca pelo browser).

Depois, cadastre alguns produtos manualmente pela aba **Table Editor > produtos** (o `fornecedor_sku` deve ser o VID/SKU real do produto na CJ Dropshipping).

## 3. Onde conseguir cada chave

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` / `SERVICE_ROLE_KEY` | Supabase > seu projeto > Project Settings > API |
| `MERCADO_PAGO_ACCESS_TOKEN` | developers.mercadopago.com > Suas integrações > Credenciais de produção |
| `CJ_DROPSHIPPING_API_KEY` | Painel CJ Dropshipping > My Account > API |
| `ZAPI_INSTANCE_ID` / `ZAPI_TOKEN` / `ZAPI_CLIENT_TOKEN` | Painel Z-API, da instância que você já usa no bot do Kick |
| `ZAPI_NOTIFICATION_PHONE` | Seu número de WhatsApp (DDI+DDD+número, ex: 5561999999999) |

## 4. Subir para o GitHub

```bash
git init
git add .
git commit -m "Primeira versão do Forziul"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/forziul.git
git push -u origin main
```

(Crie o repositório vazio antes em github.com/new — sem README, sem .gitignore, pra não dar conflito.)

## 5. Deploy na Vercel

1. Importe o repositório em vercel.com/new
2. Em **Environment Variables**, cole as mesmas variáveis do `.env.local`
3. **IMPORTANTE**: atualize `NEXT_PUBLIC_SITE_URL` para a URL real do domínio antes de configurar o webhook
4. Deploy

## 6. Configurar o webhook no Mercado Pago

No painel do Mercado Pago (developers.mercadopago.com > Suas integrações > Webhooks), configure a URL:

```
https://seu-dominio.com.br/api/webhooks/mercadopago
```

Evento: **Pagamentos**.

## Ajustar antes de ir pra produção

- **`lib/fornecedor.ts`**: o endpoint/payload da API da CJ Dropshipping está com a estrutura geral da documentação deles, mas confirme os campos exatos na sua conta antes de confiar 100% na automação (a API deles varia por versão/conta).
- **Endereço do cliente**: o checkout atual só pede nome e e-mail. Antes de automatizar o envio de verdade, adicione campos de endereço completo no formulário do carrinho (necessário pra CJ Dropshipping criar o envio).
- **Admin de produtos**: por enquanto o cadastro de produtos é manual pelo Supabase Table Editor. Se quiser, dá pra construir uma tela `/admin` autenticada depois.
