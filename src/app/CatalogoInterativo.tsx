"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { BannerAtraso } from "@/components/BannerAtraso";
import { CardEquipamento } from "@/components/CardEquipamento";
import { FiltroChips } from "@/components/FiltroChips";
import { ModalSolicitar } from "@/components/ModalSolicitar";
import { Navbar } from "@/components/Navbar";
import { Toast } from "@/components/Toast";
import { ApiDoEmprestai, apiDoNavegador, mensagemDoErro } from "@/lib/api";
import {
  PRAZO_EM_DIAS_UTEIS,
  acaoDoCard,
  casaComBusca,
  casaComFiltro,
  detalheDoCard,
  disponiveis,
  emprestimoEmAtraso,
  equipamentoDaApi,
  formatarData,
  hojeEmSaoPaulo,
  meuEmprestimoDaApi,
  somarDiasUteis,
} from "@/lib/dominio";
import type { PessoaLogada } from "@/lib/sessao";
import type { Equipamento, Filtro, MeuEmprestimo } from "@/lib/tipos";

const TEXTO_APAGADO = { color: "color-mix(in srgb, var(--color-text) 55%, transparent)" };

/**
 * Catálogo — tela de entrada (PRD §5.2, FE-02, FE-04 §3).
 *
 * Os dados vêm da API (BE-04) e são buscados no navegador, onde está o token
 * da sessão. Tudo o mais é derivado no render. Sem atualização otimista: ao
 * confirmar, a tela espera o servidor e recarrega (FE-01 §6).
 */
export function CatalogoInterativo({
  pessoa,
  api: apiInjetada,
  agora = () => new Date(),
}: {
  pessoa: PessoaLogada;
  /** Para teste; em produção, a API do navegador. */
  api?: ApiDoEmprestai;
  agora?: () => Date;
}) {
  const api = useMemo(() => apiInjetada ?? apiDoNavegador(), [apiInjetada]);

  const [itens, setItens] = useState<Equipamento[] | null>(null);
  const [meus, setMeus] = useState<MeuEmprestimo[]>([]);
  const [falhaAoCarregar, setFalhaAoCarregar] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [modal, setModal] = useState<Equipamento | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const hoje = hojeEmSaoPaulo(agora());

  const carregar = useCallback(async () => {
    try {
      const [doAcervo, dosMeus] = await Promise.all([api.equipamentos(), api.meusEmprestimos()]);
      setItens(doAcervo.map(equipamentoDaApi));
      setMeus(dosMeus.map(meuEmprestimoDaApi));
      setFalhaAoCarregar(null);
    } catch (erro) {
      setFalhaAoCarregar(mensagemDoErro(erro));
    }
  }, [api]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const atraso = emprestimoEmAtraso(meus, hoje);
  const devolverAte = somarDiasUteis(hoje, PRAZO_EM_DIAS_UTEIS);

  const visiveis = useMemo(
    () => (itens ?? []).filter((item) => casaComBusca(item, busca) && casaComFiltro(item, filtro)),
    [itens, busca, filtro],
  );

  const confirmar = async () => {
    if (!modal || enviando) return;
    setEnviando(true);
    try {
      const criado = await api.solicitar(modal.id);
      await carregar();
      setToast(`${modal.nome} é seu até ${formatarData(criado.devolverAte)}`);
    } catch (erro) {
      // A recusa do servidor aparece como veio; o card não muda (FE-04 CA-6).
      setToast(mensagemDoErro(erro));
    } finally {
      setEnviando(false);
      setModal(null);
    }
  };

  const limparToast = useCallback(() => setToast(null), []);

  return (
    <>
      <Navbar pessoa={pessoa} abaAtiva="catalogo" />

      <main className="mx-auto max-w-[1240px] px-10 pb-16 pt-9">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[30px]">Catálogo</h1>
            {itens && (
              <p className="mt-1 text-[14px]" style={TEXTO_APAGADO}>
                {disponiveis(itens).length} de {itens.length} equipamentos disponíveis agora
              </p>
            )}
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
            <BannerAtraso item={atraso.equipamento.nome} devolverAte={atraso.devolverAte} />
          </div>
        )}

        <div className="mt-5">
          <FiltroChips valor={filtro} aoMudar={setFiltro} />
        </div>

        {itens === null ? (
          <div className="mt-5 flex flex-col items-center gap-3 py-12 text-[13.5px]" style={TEXTO_APAGADO}>
            {falhaAoCarregar ? (
              <>
                <p>{falhaAoCarregar}</p>
                <button type="button" className="btn btn-secondary" onClick={() => void carregar()}>
                  Tentar de novo
                </button>
              </>
            ) : (
              <p>Carregando o catálogo…</p>
            )}
          </div>
        ) : visiveis.length > 0 ? (
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(292px,1fr))] gap-4">
            {visiveis.map((item) => (
              <CardEquipamento
                key={item.id}
                equipamento={item}
                detalhe={detalheDoCard(item)}
                acao={acaoDoCard(item, meus, hoje)}
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
          aoConfirmar={() => void confirmar()}
          aoCancelar={() => (enviando ? undefined : setModal(null))}
          enviando={enviando}
        />
      )}

      {toast && <Toast texto={toast} aoSumir={limparToast} />}
    </>
  );
}
