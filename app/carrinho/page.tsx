"use client";

import Link from "next/link";
import { useState } from "react";
import { useCarrinho } from "@/lib/cart-context";
import { formatarPreco } from "@/lib/types";

export default function CarrinhoPage() {
  const { itens, remover, atualizarQuantidade, totalCentavos } = useCarrinho();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function finalizarCompra() {
    setErro(null);

    if (!nome.trim() || !email.trim()) {
      setErro("Preencha nome e e-mail para continuar.");
      return;
    }
    if (itens.length === 0) {
      setErro("Seu carrinho está vazio.");
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: { nome, email },
          itens: itens.map((i) => ({
            produtoId: i.produto.id,
            quantidade: i.quantidade,
          })),
        }),
      });

      if (!resp.ok) throw new Error("Falha ao criar pagamento");

      const { checkoutUrl } = await resp.json();
      window.location.href = checkoutUrl;
    } catch {
      setErro("Não foi possível iniciar o pagamento. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (itens.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Seu carrinho está vazio</h1>
        <Link href="/loja" className="mt-4 inline-block text-volt hover:underline">
          Ver produtos →
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold">Carrinho</h1>
      <div className="trace my-8" />

      <ul className="space-y-4">
        {itens.map(({ produto, quantidade }) => (
          <li
            key={produto.id}
            className="flex items-center justify-between rounded-md border border-base-line bg-base-raised p-4"
          >
            <div>
              <p className="font-medium">{produto.nome}</p>
              <p className="font-mono text-sm text-volt">
                {formatarPreco(produto.preco_centavos)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) =>
                  atualizarQuantidade(produto.id, Number(e.target.value))
                }
                className="w-16 rounded-sm border border-base-line bg-base px-2 py-1 text-center"
              />
              <button
                onClick={() => remover(produto.id)}
                className="text-sm text-ink-muted hover:text-signal"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between border-t border-base-line pt-6">
        <span className="text-ink-muted">Total</span>
        <span className="font-mono text-2xl text-volt">
          {formatarPreco(totalCentavos)}
        </span>
      </div>

      <div className="mt-8 space-y-4">
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-sm border border-base-line bg-base-raised px-4 py-3"
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-sm border border-base-line bg-base-raised px-4 py-3"
        />

        {erro && <p className="text-sm text-signal">{erro}</p>}

        <button
          onClick={finalizarCompra}
          disabled={enviando}
          className="w-full rounded-sm bg-volt px-6 py-3 font-medium text-base transition hover:bg-volt-dim disabled:opacity-50"
        >
          {enviando ? "Redirecionando…" : "Pagar com Mercado Pago"}
        </button>
      </div>
    </section>
  );
}
