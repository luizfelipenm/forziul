import Image from "next/image";
import { notFound } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import { Produto, formatarPreco } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";

async function getProduto(slug: string): Promise<Produto | null> {
  try {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("slug", slug)
      .eq("ativo", true)
      .single();

    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export default async function ProdutoPage({
  params,
}: {
  params: { slug: string };
}) {
  const produto = await getProduto(params.slug);

  if (!produto) notFound();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-md border border-base-line bg-base-raised">
          {produto.imagem_url ? (
            <Image
              src={produto.imagem_url}
              alt={produto.nome}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-muted">
              sem imagem
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold">{produto.nome}</h1>
          <p className="mt-3 font-mono text-2xl text-volt">
            {formatarPreco(produto.preco_centavos)}
          </p>
          <p className="mt-6 text-ink-muted">
            {produto.descricao ?? "Sem descrição cadastrada."}
          </p>

          <div className="mt-8">
            <AddToCartButton produto={produto} />
          </div>

          <p className="mt-4 text-xs text-ink-muted">
            Estoque: {produto.estoque > 0 ? `${produto.estoque} unidades` : "sob encomenda"}
          </p>
        </div>
      </div>
    </section>
  );
}
