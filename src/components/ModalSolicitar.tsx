"use client";

import { useEffect } from "react";
import type { Equipamento } from "@/lib/tipos";

/**
 * Regra 1: confirmar empréstimo. Clique fora fecha, clique dentro não
 * propaga; o valor do resumo vai em destaque no acento (PRD, seção 5.6).
 */
export function ModalSolicitar({
  equipamento,
  devolverAte,
  aoConfirmar,
  aoCancelar,
}: {
  equipamento: Equipamento;
  devolverAte: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}) {
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoCancelar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoCancelar]);

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onClick={aoCancelar}
    >
      <div
        className="dialog animate-fadeUp-modal elev-lg"
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar empréstimo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 className="text-[20px]">Confirmar empréstimo</h2>
        <p
          className="mt-3 text-[13.5px]"
          style={{ color: "color-mix(in srgb, var(--color-text) 62%, transparent)" }}
        >
          O item sai do catálogo e passa a contar no seu limite de 3 itens.
        </p>

        <div
          className="mt-[18px] rounded-md border px-4 py-[14px]"
          style={{ borderColor: "var(--color-divider)" }}
        >
          <Linha rotulo="Item" valor={equipamento.nome} />
          <Linha rotulo="Devolver até" valor={devolverAte} destaque />
        </div>

        <div className="mt-[22px] flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={aoCancelar}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={aoConfirmar}>
            Confirmar empréstimo
          </button>
        </div>
      </div>
    </div>
  );
}

function Linha({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-[3px]">
      <span
        className="text-[12.5px]"
        style={{ color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}
      >
        {rotulo}
      </span>
      <span
        className="text-[13.5px] font-medium"
        style={destaque ? { color: "var(--color-accent-300)" } : undefined}
      >
        {valor}
      </span>
    </div>
  );
}
