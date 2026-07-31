import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso no browser (componentes "use client")
 * e em Server Components de leitura pública.
 *
 * Usa a chave "anon" — segura para expor no client, protegida pelas
 * políticas de RLS configuradas no banco (ver supabase/schema.sql).
 */
export function createBrowserSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas."
    );
  }

  return createClient(url, anonKey);
}

/**
 * Cliente Supabase com a service role key — SOMENTE para uso em
 * Edge Functions / rotas de servidor (nunca no browser). Usado para
 * criar pedidos, atualizar status de pagamento e acionar o fornecedor.
 */
export function createServiceSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas."
    );
  }

  return createClient(url, serviceKey);
}
