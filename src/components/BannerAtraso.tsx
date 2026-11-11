import Link from "next/link";

import { formatarData } from "@/lib/dominio";

/** Regra 5: banner vermelho no topo do catálogo, com atalho para o pendente. */
export function BannerAtraso({
  item,
  devolverAte,
}: {
  item: string;
  devolverAte: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-md border px-4 py-3 text-[13.5px]"
      style={{
        borderColor: "var(--banner-bd)",
        background: "var(--banner-bg)",
        color: "var(--banner-fg)",
      }}
    >
      <span>
        Você tem um item em atraso: <strong>{item}</strong>, com prazo vencido em{" "}
        {formatarData(devolverAte)}. Novos empréstimos ficam bloqueados até a devolução.
      </span>
      <Link href="/meus-emprestimos" className="btn btn-ghost ml-auto shrink-0">
        Ver em Meus empréstimos →
      </Link>
    </div>
  );
}
