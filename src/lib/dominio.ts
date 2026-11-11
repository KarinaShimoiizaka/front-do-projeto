import type {
  Categoria,
  Equipamento,
  EquipamentoDaApi,
  EstadoPrazo,
  Filtro,
  MeuEmprestimo,
  MeuEmprestimoDaApi,
} from "./tipos";

/** Regras de negócio da v1 (PRD §7, alterado em 11/11/2026). */
export const LIMITE_POR_PESSOA = 5;
export const PRAZO_EM_DIAS_UTEIS = 14;

/** Dias a partir dos quais o prazo passa a ser sinalizado como "a vencer". */
const JANELA_A_VENCER = 3;

const DIA_EM_MS = 86_400_000;
const FUSO = "America/Sao_Paulo";

/** O dia de `agora` em São Paulo, como `AAAA-MM-DD` (BE-04 §4). */
export function hojeEmSaoPaulo(agora: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/**
 * Soma dias úteis (segunda a sexta), contando a partir do dia seguinte. É a
 * mesma regra da BE-04 §4; feriados não contam na v1. O servidor é quem
 * decide a data de verdade; aqui é para mostrar no modal antes de confirmar.
 */
export function somarDiasUteis(iso: string, dias: number): string {
  const data = new Date(`${iso}T12:00:00Z`);
  let contados = 0;
  while (contados < dias) {
    data.setUTCDate(data.getUTCDate() + 1);
    const diaDaSemana = data.getUTCDay();
    if (diaDaSemana !== 0 && diaDaSemana !== 6) contados++;
  }
  return data.toISOString().slice(0, 10);
}

export function diasRestantes(devolverAte: string, hoje: string): number {
  const alvo = new Date(`${devolverAte}T00:00:00Z`).getTime();
  const base = new Date(`${hoje}T00:00:00Z`).getTime();
  return Math.round((alvo - base) / DIA_EM_MS);
}

export function estadoDoPrazo(devolverAte: string, hoje: string): EstadoPrazo {
  const dias = diasRestantes(devolverAte, hoje);
  if (dias < 0) return "atrasado";
  if (dias <= JANELA_A_VENCER) return "a-vencer";
  return "em-dia";
}

/** Regra 5: qualquer item em atraso bloqueia novos empréstimos da pessoa. */
export function emprestimoEmAtraso(meus: MeuEmprestimo[], hoje: string): MeuEmprestimo | undefined {
  return meus.find((e) => estadoDoPrazo(e.devolverAte, hoje) === "atrasado");
}

/** Regra 4: com 5 empréstimos ativos, não se solicita mais nada. */
export function atingiuLimite(meus: MeuEmprestimo[]): boolean {
  return meus.length >= LIMITE_POR_PESSOA;
}

/** Regra 6: manutenção nunca conta como disponível. */
export function disponiveis(equipamentos: Equipamento[]): Equipamento[] {
  return equipamentos.filter((eq) => eq.situacao === "disponivel");
}

/** Regra 8: busca por nome + patrimônio, case-insensitive. */
export function casaComBusca(equipamento: Equipamento, termo: string): boolean {
  const alvo = termo.trim().toLowerCase();
  if (!alvo) return true;
  return (
    equipamento.nome.toLowerCase().includes(alvo) ||
    equipamento.patrimonio.toLowerCase().includes(alvo)
  );
}

/** Regra 9: filtros de situação, exclusivos entre si. */
export function casaComFiltro(equipamento: Equipamento, filtro: Filtro): boolean {
  switch (filtro) {
    case "disponiveis":
      return equipamento.situacao === "disponivel";
    case "emprestados":
      return equipamento.situacao === "emprestado";
    case "manutencao":
      return equipamento.situacao === "manutencao";
    default:
      return true;
  }
}

export type AcaoDoCard = {
  rotulo: string;
  habilitado: boolean;
  variante: "primary" | "secondary";
};

/**
 * Rótulo e habilitação do botão de cada card, derivados no render, na ordem
 * da FE-02 §5.1: manutenção nunca é solicitável, a posse do item vence o
 * atraso e o limite (não faz sentido dizer "limite" num item que já é seu).
 */
export function acaoDoCard(equipamento: Equipamento, meus: MeuEmprestimo[], hoje: string): AcaoDoCard {
  if (equipamento.situacao === "manutencao") {
    return { rotulo: "Indisponível", habilitado: false, variante: "secondary" };
  }

  if (equipamento.situacao === "emprestado") {
    return equipamento.emprestimo?.comVoce
      ? { rotulo: "Está com você", habilitado: false, variante: "secondary" }
      : { rotulo: "Emprestado", habilitado: false, variante: "secondary" };
  }

  if (emprestimoEmAtraso(meus, hoje)) {
    return { rotulo: "Bloqueado por atraso", habilitado: false, variante: "secondary" };
  }

  if (atingiuLimite(meus)) {
    return { rotulo: `Limite de ${LIMITE_POR_PESSOA} itens`, habilitado: false, variante: "secondary" };
  }

  return { rotulo: "Solicitar empréstimo", habilitado: true, variante: "primary" };
}

/** Linha de detalhe do card (min-height 18px no layout). */
export function detalheDoCard(equipamento: Equipamento): string {
  if (equipamento.situacao === "manutencao") {
    return equipamento.observacao ?? "Em manutenção";
  }
  if (equipamento.emprestimo) {
    return `Com ${equipamento.emprestimo.pessoa} · devolver até ${formatarData(equipamento.emprestimo.devolverAte)}`;
  }
  return "Pronto para retirada no balcão";
}

// --- Da API para a tela -------------------------------------------------

const CATEGORIAS: Record<string, Categoria> = {
  notebook: "Notebook",
  monitor: "Monitor",
  cabo: "Cabo",
  camera: "Câmera",
  acessorio: "Acessório",
};

export function categoriaDaApi(categoria: string): Categoria {
  return CATEGORIAS[categoria] ?? "Acessório";
}

export function equipamentoDaApi(e: EquipamentoDaApi): Equipamento {
  return { ...e, categoria: categoriaDaApi(e.categoria) };
}

export function meuEmprestimoDaApi(m: MeuEmprestimoDaApi): MeuEmprestimo {
  return { ...m, equipamento: { ...m.equipamento, categoria: categoriaDaApi(m.equipamento.categoria) } };
}
