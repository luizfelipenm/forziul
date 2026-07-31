import Image from "next/image";
import Link from "next/link";
import { Produto, formatarPreco } from "@/lib/types";

export default function ProductCard({ produto }: { produto: Produto }) {
  return (
    <Link
      href={`/produto/${produto.slug}`}
      className="group block overflow-hidden rounded-md border border-base-line bg-base-raised transition hover:border-volt/60"
    >
      <div className="relative aspect-square bg-base">
        {produto.imagem_url ? (
          <Image
            src={produto.imagem_url}
            alt={produto.nome}
            fill
            className="object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            sem imagem
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-medium">{produto.nome}</h3>
        <p className="mt-1 font-mono text-volt">
          {formatarPreco(produto.preco_centavos)}
        </p>
      </div>
    </Link>
  );
}
