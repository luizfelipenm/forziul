import Link from "next/link";

export default function PedidoSucesso() {
  return (
    <section className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-volt">
        Pedido confirmado
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold">
        Recebemos seu pagamento
      </h1>
      <p className="mt-4 text-ink-muted">
        Assim que a confirmação for processada, seu pedido é enviado
        automaticamente para separação e envio. Você receberá o
        acompanhamento por e-mail.
      </p>
      <Link href="/loja" className="mt-8 inline-block text-volt hover:underline">
        Continuar comprando →
      </Link>
    </section>
  );
}
