import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase";
import { Produto } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

async function getDestaques(): Promise<Produto[]> {
  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("criado_em", { ascending: false })
      .limit(4);

    if (error) throw error;
    return data ?? [];
  } catch {
    // Sem Supabase configurado ainda — retorna vazio, a UI trata isso.
    return [];
  }
}

export default async function Home() {
  const destaques = await getDestaques();

  return (
    <>
      {/* HERO — assinatura visual: wordmark cortado por uma trilha de "voltagem" */}
      <section className="relative overflow-hidden border-b border-base-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
            Eletrônicos · Entrega para todo o Brasil
          </p>
          <h1 className="font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-8xl">
            <span className="block">FOR</span>
            <span className="relative block text-volt">
              ZIUL
              <svg
                aria-hidden
                viewBox="0 0 200 24"
                className="absolute -left-2 -top-3 h-6 w-[110%] text-volt/60"
              >
                <path
                  d="M0 12 L40 12 L48 2 L56 20 L64 8 L72 12 L200 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-muted">
            Peças e gadgets selecionados, com acompanhamento de pedido do
            pagamento até a porta da sua casa.
          </p>
          <Link
            href="/loja"
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-volt px-6 py-3 font-medium text-base transition hover:bg-volt-dim"
          >
            Ver produtos
          </Link>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold">Em destaque</h2>
          <Link href="/loja" className="text-sm text-ink-muted hover:text-volt">
            Ver tudo →
          </Link>
        </div>

        {destaques.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {destaques.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-base-line p-10 text-center text-ink-muted">
            <p className="font-medium text-ink">Nenhum produto cadastrado ainda.</p>
            <p className="mt-1 text-sm">
              Configure o Supabase e cadastre produtos na tabela{" "}
              <code className="font-mono text-volt">produtos</code> para eles
              aparecerem aqui.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
