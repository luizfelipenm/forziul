import { createBrowserSupabase } from "@/lib/supabase";
import { Produto } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

async function getProdutos(): Promise<Produto[]> {
  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function Loja() {
  const produtos = await getProdutos();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold">Loja</h1>
      <div className="trace my-8" />

      {produtos.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {produtos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      ) : (
        <p className="text-ink-muted">
          Nenhum produto cadastrado ainda. Cadastre produtos na tabela{" "}
          <code className="font-mono text-volt">produtos</code> no Supabase.
        </p>
      )}
    </section>
  );
}
