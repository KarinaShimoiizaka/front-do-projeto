"use client";

import { Pill } from "./Pill";
import type { AcaoDoCard } from "@/lib/dominio";
import type { Equipamento } from "@/lib/tipos";

export function CardEquipamento({
  equipamento,
  detalhe,
  acao,
  aoSolicitar,
}: {
  equipamento: Equipamento;
  detalhe: string;
  acao: AcaoDoCard;
  aoSolicitar: () => void;
}) {
  return (
    <article className="card animate-fadeUp elev-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="card-kicker">{equipamento.categoria}</p>
          <h2 className="card-title mt-[2px]">{equipamento.nome}</h2>
          <p
            className="mt-[2px] text-[12px]"
            style={{ color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}
          >
            {equipamento.patrimonio}
          </p>
        </div>
        <Pill situacao={equipamento.situacao} />
      </div>

      <p
        className="min-h-[18px] text-[12.5px]"
        style={{ color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}
      >
        {detalhe}
      </p>

      <button
        type="button"
        onClick={aoSolicitar}
        disabled={!acao.habilitado}
        className={`btn btn-block ${acao.variante === "primary" ? "btn-primary" : "btn-secondary"}`}
      >
        {acao.rotulo}
      </button>
    </article>
  );
}
