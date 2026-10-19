"use client";

import { useCallback, useMemo, useState } from "react";

import { BannerAtraso } from "@/components/BannerAtraso";
import { CardEquipamento } from "@/components/CardEquipamento";
import { FiltroChips } from "@/components/FiltroChips";
import { ModalSolicitar } from "@/components/ModalSolicitar";
import { Navbar } from "@/components/Navbar";
import { Toast } from "@/components/Toast";
import type { PessoaLogada } from "@/lib/sessao";
import { EMPRESTIMOS, EQUIPAMENTOS, HOJE, USUARIO } from "@/lib/dados";
import {
  PRAZO_EM_DIAS,
  acaoDoCard,
  casaComBusca,
  casaComFiltro,
  detalheDoCard,
  disponiveis,
  emprestimoEmAtraso,
  formatarData,
  somarDias,
} from "@/lib/dominio";
import type { Emprestimo, Equipamento, Filtro } from "@/lib/tipos";

/**
 * Catálogo — tela de entrada do papel Colaborador (PRD, seção 5.2).
 *
 * O estado vive em memória e tudo o mais é derivado no render: contagens,
 * cor de pill, rótulo e habilitação de cada botão. Quando o backend existir,
 * `itens` e `emprestimos` passam a vir da API; a derivação continua igual.
 */
export function CatalogoInterativo({ pessoa }: { pessoa: PessoaLogada }) {
  const [itens, setItens] = useState<Equipamento[]>(EQUIPAMENTOS);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>(EMPRESTIMOS);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [modal, setModal] = useState<Equipamento | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const atraso = emprestimoEmAtraso(emprestimos, USUARIO.nome, HOJE);
  const devolverAte = somarDias(HOJE, PRAZO_EM_DIAS);

  const visiveis = useMemo(
    () => itens.filter((item) => casaComBusca(item, busca) && casaComFiltro(item, filtro)),
    [itens, busca, filtro],
  );

  const confirmar = () => {
    if (!modal) return;
    setItens((atuais) =>
      atuais.map((item) =>
        item.id === modal.id ? { ...item, situacao: "emprestado" } : item,
      ),
    );
    setEmprestimos((atuais) => [
      ...atuais,
      {
        id: `emp-${modal.id}`,
        equipamentoId: modal.id,
        pessoa: USUARIO.nome,
        retiradaEm: HOJE,
        devolverAte,
      },
    ]);
    setToast(`${modal.nome} é seu até ${formatarData(devolverAte)}`);
    setModal(null);
  };

  const limparToast = useCallback(() => setToast(null), []);

  return (
    <>
      <Navbar pessoa={pessoa} abaAtiva="catalogo" />

      <main className="mx-auto max-w-[1240px] px-10 pb-16 pt-9">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[30px]">Catálogo</h1>
            <p
              className="mt-1 text-[14px]"
              style={{ color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}
            >
              {disponiveis(itens).length} de {itens.length} equipamentos disponíveis agora
            </p>
          </div>
          <input
            className="input w-[260px]"
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Buscar por nome ou patrimônio"
            aria-label="Buscar equipamento"
          />
        </header>

        {atraso && (
          <div className="mt-5">
            <BannerAtraso
              item={itens.find((i) => i.id === atraso.equipamentoId)?.nome ?? "item"}
              devolverAte={atraso.devolverAte}
            />
          </div>
        )}

        <div className="mt-5">
          <FiltroChips valor={filtro} aoMudar={setFiltro} />
        </div>

        {visiveis.length > 0 ? (
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(292px,1fr))] gap-4">
            {visiveis.map((item) => (
              <CardEquipamento
                key={item.id}
                equipamento={item}
                detalhe={detalheDoCard(item, emprestimos)}
                acao={acaoDoCard(item, emprestimos, USUARIO.nome, HOJE)}
                aoSolicitar={() => setModal(item)}
              />
            ))}
          </div>
        ) : (
          <p
            className="mt-5 rounded-lg border border-dashed py-12 text-center text-[13.5px]"
            style={{
              borderColor: "var(--color-divider)",
              color: "color-mix(in srgb, var(--color-text) 45%, transparent)",
            }}
          >
            Nenhum equipamento encontrado para esta busca.
          </p>
        )}
      </main>

      {modal && (
        <ModalSolicitar
          equipamento={modal}
          devolverAte={formatarData(devolverAte)}
          aoConfirmar={confirmar}
          aoCancelar={() => setModal(null)}
        />
      )}

      {toast && <Toast texto={toast} aoSumir={limparToast} />}
    </>
  );
}
