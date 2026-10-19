"use client";

import type { Filtro } from "@/lib/tipos";

const OPCOES: { chave: Filtro; rotulo: string }[] = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "disponiveis", rotulo: "Disponíveis" },
  { chave: "emprestados", rotulo: "Emprestados" },
  { chave: "manutencao", rotulo: "Em manutenção" },
];

/** Regra 9: filtros exclusivos; o ativo ganha borda, texto e fundo no acento. */
export function FiltroChips({
  valor,
  aoMudar,
}: {
  valor: Filtro;
  aoMudar: (filtro: Filtro) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPCOES.map((opcao) => {
        const ativo = opcao.chave === valor;
        return (
          <button
            key={opcao.chave}
            type="button"
            onClick={() => aoMudar(opcao.chave)}
            className="rounded-[999px] border px-[13px] py-[5px] text-[12.5px] transition-colors"
            style={
              ativo
                ? {
                    borderColor: "var(--color-accent)",
                    color: "var(--color-accent-300)",
                    background: "var(--accent-tint-10)",
                  }
                : {
                    borderColor: "var(--color-divider)",
                    color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
                  }
            }
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
