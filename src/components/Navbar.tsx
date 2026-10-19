"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Marca } from "./Marca";
import type { PessoaLogada } from "@/lib/sessao";
import { clienteDoNavegador } from "@/lib/supabase/cliente-navegador";

/**
 * Barra de topo. As abas saem do papel da pessoa (FE-03 §6): Colaborador vê
 * duas, Operações vê quatro. Só o Catálogo tem tela construída; as demais
 * ficam inertes em vez de levar a um 404.
 */
const ABAS = [
  { chave: "catalogo", rotulo: "Catálogo", pronta: true, soOperacoes: false },
  { chave: "meus", rotulo: "Meus empréstimos", pronta: false, soOperacoes: false },
  { chave: "operacoes", rotulo: "Operações", pronta: false, soOperacoes: true },
  { chave: "equipamentos", rotulo: "Equipamentos", pronta: false, soOperacoes: true },
] as const;

const NOME_DO_PAPEL = {
  colaborador: "Colaborador",
  operacoes: "Operações",
} as const;

export function Navbar({
  pessoa,
  abaAtiva = "catalogo",
}: {
  pessoa: PessoaLogada;
  abaAtiva?: string;
}) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  const abas = ABAS.filter(
    (aba) => !aba.soOperacoes || pessoa.papel === "operacoes",
  );

  async function sair() {
    setSaindo(true);
    await clienteDoNavegador().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav className="nav">
      <Marca tamanho={15} />

      <div className="flex items-center">
        {abas.map((aba) => (
          <button
            key={aba.chave}
            type="button"
            className="nav-tab"
            data-active={aba.chave === abaAtiva}
            disabled={!aba.pronta}
            title={aba.pronta ? undefined : "Tela ainda não construída"}
            style={aba.pronta ? undefined : { opacity: 0.45, cursor: "not-allowed" }}
          >
            {aba.rotulo}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-[14px]">
        <span className="tag-outline">{NOME_DO_PAPEL[pessoa.papel]}</span>
        <span
          className="grid h-7 w-7 place-items-center rounded-[999px] border text-[11.5px] font-semibold"
          style={{
            background: "var(--color-accent-900)",
            borderColor: "var(--color-accent-700)",
            color: "var(--color-accent-300)",
          }}
        >
          {pessoa.iniciais}
        </span>
        <span className="text-[13.5px]">{pessoa.nome}</span>
        <button type="button" className="btn btn-ghost" onClick={sair} disabled={saindo}>
          {saindo ? "Saindo…" : "Sair"}
        </button>
      </div>
    </nav>
  );
}
