"use client";

import { useState } from "react";
import { useCarrinho } from "@/lib/cart-context";
import { Produto } from "@/lib/types";

export default function AddToCartButton({ produto }: { produto: Produto }) {
  const { adicionar } = useCarrinho();
  const [adicionado, setAdicionado] = useState(false);

  function handleClick() {
    adicionar(produto, 1);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-sm bg-volt px-6 py-3 font-medium text-base transition hover:bg-volt-dim"
    >
      {adicionado ? "Adicionado ✓" : "Adicionar ao carrinho"}
    </button>
  );
}
