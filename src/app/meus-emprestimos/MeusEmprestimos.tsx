"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { ApiDoEmprestai, apiDoNavegador, mensagemDoErro } from "@/lib/api";
import {
  LIMITE_POR_PESSOA,
  PRAZO_EM_DIAS_UTEIS,
  estadoDoPrazo,
  formatarData,
  hojeEmSaoPaulo,
  meuEmprestimoDaApi,
} from "@/lib/dominio";
import type { PessoaLogada } from "@/lib/sessao";
import type { EstadoPrazo, MeuEmprestimo } from "@/lib/tipos";

const COR_DO_ESTADO: Record<EstadoPrazo, { rotulo: string; fg: string; bg: string; bd: string }> = {
  "em-dia": { rotulo: "Em dia", fg: "var(--st-ok-fg)", bg: "var(--st-ok-bg)", bd: "var(--st-ok-bd)" },
  "a-vencer": { rotulo: "A vencer", fg: "var(--st-warn-fg)", bg: "var(--st-warn-bg)", bd: "var(--st-warn-bd)" },
  atrasado: { rotulo: "Em atraso", fg: "var(--st-late-fg)", bg: "var(--st-late-bg)", bd: "var(--st-late-bd)" },
};

const TEXTO_APAGADO = { color: "color-mix(in srgb, var(--color-text) 55%, transparent)" };

/**
 * Meus empréstimos (PRD §5.3, FE-04 §4): os empréstimos em aberto da pessoa,
 * com a data de devolução. Sem botão "Devolver": devolução está fora de
 * escopo nesta fase.
 */
export function MeusEmprestimos({
  pessoa,
  api: apiInjetada,
  agora = () => new Date(),
}: {
  pessoa: PessoaLogada;
  api?: ApiDoEmprestai;
  agora?: () => Date;
}) {
  const api = useMemo(() => apiInjetada ?? apiDoNavegador(), [apiInjetada]);
  const [meus, setMeus] = useState<MeuEmprestimo[] | null>(null);
  const [falha, setFalha] = useState<string | null>(null);
  const hoje = hojeEmSaoPaulo(agora());

  const carregar = useCallback(async () => {
    try {
      setMeus((await api.meusEmprestimos()).map(meuEmprestimoDaApi));
      setFalha(null);
    } catch (erro) {
      setFalha(mensagemDoErro(erro));
    }
  }, [api]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <>
      <Navbar pessoa={pessoa} abaAtiva="meus" />

      <main className="mx-auto max-w-[1000px] px-10 pb-16 pt-9">
        <header>
          <h1 className="text-[30px]">Meus empréstimos</h1>
          {meus && (
            <p className="mt-1 text-[14px]" style={TEXTO_APAGADO}>
              {meus.length} de {LIMITE_POR_PESSOA} itens em seu nome · prazo padrão de {PRAZO_EM_DIAS_UTEIS} dias
              úteis
            </p>
          )}
        </header>

        {meus === null ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-12 text-[13.5px]" style={TEXTO_APAGADO}>
            {falha ? (
              <>
                <p>{falha}</p>
                <button type="button" className="btn btn-secondary" onClick={() => void carregar()}>
                  Tentar de novo
                </button>
              </>
            ) : (
              <p>Carregando seus empréstimos…</p>
            )}
          </div>
        ) : (
          <>
            <Tracos meus={meus} hoje={hoje} />

            {meus.length === 0 ? (
              <div
                className="mt-6 flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center text-[13.5px]"
                style={{ borderColor: "var(--color-divider)", ...TEXTO_APAGADO }}
              >
                <p>Você não tem nenhum empréstimo em aberto.</p>
                <Link href="/" className="btn btn-primary">
                  Ir ao catálogo
                </Link>
              </div>
            ) : (
              <ul className="mt-6 flex flex-col gap-3" aria-label="Empréstimos em aberto">
                {meus.map((emprestimo) => (
                  <LinhaDeEmprestimo key={emprestimo.id} emprestimo={emprestimo} hoje={hoje} />
                ))}
              </ul>
            )}

            <ul className="mt-8 flex flex-col gap-1 text-[12.5px]" style={TEXTO_APAGADO}>
              <li>— Até {LIMITE_POR_PESSOA} itens em aberto por pessoa.</li>
              <li>— Prazo padrão de {PRAZO_EM_DIAS_UTEIS} dias úteis, contados de segunda a sexta.</li>
              <li>— Um item em atraso bloqueia novos empréstimos até a devolução.</li>
            </ul>
          </>
        )}
      </main>
    </>
  );
}

/** Barra de traços: ocupados no acento, em atraso em vermelho, vazios apagados (PRD §5.3). */
function Tracos({ meus, hoje }: { meus: MeuEmprestimo[]; hoje: string }) {
  return (
    <div className="mt-5 flex gap-[6px]" aria-hidden>
      {Array.from({ length: LIMITE_POR_PESSOA }, (_, i) => {
        const emprestimo = meus[i];
        const cor = !emprestimo
          ? "color-mix(in srgb, var(--color-text) 12%, transparent)"
          : estadoDoPrazo(emprestimo.devolverAte, hoje) === "atrasado"
            ? "var(--st-late-fg)"
            : "var(--color-accent)";
        return <span key={i} className="h-[5px] flex-1 rounded-[999px]" style={{ background: cor }} />;
      })}
    </div>
  );
}

/**
 * Uma linha do PRD §5.3: colunas de flex na proporção item 1.4 · Retirada 1
 * · Devolver até 1 · pill 0.9, padding 18px 20px e gap de 20px. A `.card`
 * empilha em coluna; aqui a direção é trocada para linha. Em tela estreita,
 * o item ocupa a primeira linha e as outras colunas quebram abaixo.
 */
function LinhaDeEmprestimo({ emprestimo, hoje }: { emprestimo: MeuEmprestimo; hoje: string }) {
  const estado = COR_DO_ESTADO[estadoDoPrazo(emprestimo.devolverAte, hoje)];
  return (
    <li
      className="card flex-row flex-wrap items-center gap-5 px-5 py-[18px] md:flex-nowrap"
      style={{ borderLeft: `3px solid ${estado.fg}` }}
    >
      <div className="flex min-w-0 basis-full items-center gap-4 md:basis-0 md:flex-[1.4]">
        {emprestimo.equipamento.imagemUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={emprestimo.equipamento.imagemUrl}
            alt=""
            width={96}
            height={72}
            className="h-[72px] w-24 shrink-0 rounded-md object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="card-kicker">{emprestimo.equipamento.categoria}</p>
          <p className="mt-[2px] truncate text-[15px] font-medium">{emprestimo.equipamento.nome}</p>
          <p className="mt-[2px] text-[12px]" style={TEXTO_APAGADO}>
            {emprestimo.equipamento.patrimonio}
          </p>
        </div>
      </div>
      <Coluna rotulo="Retirada" valor={formatarData(emprestimo.retiradaEm)} />
      <Coluna rotulo="Devolver até" valor={formatarData(emprestimo.devolverAte)} cor={estado.fg} />
      <div className="flex flex-[0.9] justify-end">
        <span className="pill" style={{ color: estado.fg, background: estado.bg, borderColor: estado.bd }}>
          {estado.rotulo}
        </span>
      </div>
    </li>
  );
}

function Coluna({ rotulo, valor, cor }: { rotulo: string; valor: string; cor?: string }) {
  return (
    <div className="min-w-[110px] flex-1">
      <p className="text-[11px] uppercase tracking-wide" style={TEXTO_APAGADO}>
        {rotulo}
      </p>
      <p className="mt-[2px] text-[14px]" style={cor ? { color: cor } : undefined}>
        {valor}
      </p>
    </div>
  );
}
