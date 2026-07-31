"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ItemCarrinho, Produto } from "./types";

type CarrinhoContextType = {
  itens: ItemCarrinho[];
  adicionar: (produto: Produto, quantidade?: number) => void;
  remover: (produtoId: string) => void;
  atualizarQuantidade: (produtoId: string, quantidade: number) => void;
  limpar: () => void;
  totalCentavos: number;
};

const CarrinhoContext = createContext<CarrinhoContextType | null>(null);

const STORAGE_KEY = "forziul_carrinho";

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [carregado, setCarregado] = useState(false);

  // Carrega do localStorage apenas no client, após montar
  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(STORAGE_KEY);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {
      // localStorage indisponível — carrinho começa vazio
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
  }, [itens, carregado]);

  function adicionar(produto: Produto, quantidade = 1) {
    setItens((atual) => {
      const existente = atual.find((i) => i.produto.id === produto.id);
      if (existente) {
        return atual.map((i) =>
          i.produto.id === produto.id
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        );
      }
      return [...atual, { produto, quantidade }];
    });
  }

  function remover(produtoId: string) {
    setItens((atual) => atual.filter((i) => i.produto.id !== produtoId));
  }

  function atualizarQuantidade(produtoId: string, quantidade: number) {
    if (quantidade <= 0) return remover(produtoId);
    setItens((atual) =>
      atual.map((i) =>
        i.produto.id === produtoId ? { ...i, quantidade } : i
      )
    );
  }

  function limpar() {
    setItens([]);
  }

  const totalCentavos = itens.reduce(
    (soma, i) => soma + i.produto.preco_centavos * i.quantidade,
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{ itens, adicionar, remover, atualizarQuantidade, limpar, totalCentavos }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) {
    throw new Error("useCarrinho precisa ser usado dentro de <CarrinhoProvider>");
  }
  return ctx;
}
