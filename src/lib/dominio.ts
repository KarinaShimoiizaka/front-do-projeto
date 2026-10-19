import type { Emprestimo, Equipamento, EstadoPrazo, Filtro } from "./tipos";

/** Regras de negócio da v1 (PRD, seção 7). */
export const LIMITE_POR_PESSOA = 3;
export const PRAZO_EM_DIAS = 14;

/** Dias a partir dos quais o prazo passa a ser sinalizado como "a vencer". */
const JANELA_A_VENCER = 3;

const DIA_EM_MS = 86_400_000;

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function somarDias(iso: string, dias: number): string {
  const data = new Date(`${iso}T00:00:00`);
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

export function diasRestantes(devolverAte: string, hoje: string): number {
  const alvo = new Date(`${devolverAte}T00:00:00`).getTime();
  const base = new Date(`${hoje}T00:00:00`).getTime();
  return Math.round((alvo - base) / DIA_EM_MS);
}

export function estadoDoPrazo(devolverAte: string, hoje: string): EstadoPrazo {
  const dias = diasRestantes(devolverAte, hoje);
  if (dias < 0) return "atrasado";
  if (dias <= JANELA_A_VENCER) return "a-vencer";
  return "em-dia";
}

export function emprestimosDe(emprestimos: Emprestimo[], pessoa: string): Emprestimo[] {
  return emprestimos.filter((e) => e.pessoa === pessoa);
}

/** Regra 5: qualquer item em atraso bloqueia novos empréstimos da pessoa. */
export function emprestimoEmAtraso(
  emprestimos: Emprestimo[],
  pessoa: string,
  hoje: string,
): Emprestimo | undefined {
  return emprestimosDe(emprestimos, pessoa).find(
    (e) => estadoDoPrazo(e.devolverAte, hoje) === "atrasado",
  );
}

/** Regra 4: com 3 empréstimos ativos, não se solicita mais nada. */
export function atingiuLimite(emprestimos: Emprestimo[], pessoa: string): boolean {
  return emprestimosDe(emprestimos, pessoa).length >= LIMITE_POR_PESSOA;
}

export function emprestimoDoEquipamento(
  emprestimos: Emprestimo[],
  equipamentoId: string,
): Emprestimo | undefined {
  return emprestimos.find((e) => e.equipamentoId === equipamentoId);
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
 * Rótulo e habilitação do botão de cada card, derivados no render.
 * A ordem das verificações é a das regras 5 a 7 do PRD: atraso bloqueia
 * antes de tudo, manutenção nunca é solicitável, e a posse do item vence o
 * limite de 3 (não faz sentido dizer "limite" num item que já é seu).
 */
export function acaoDoCard(
  equipamento: Equipamento,
  emprestimos: Emprestimo[],
  pessoa: string,
  hoje: string,
): AcaoDoCard {
  if (equipamento.situacao === "manutencao") {
    return { rotulo: "Indisponível", habilitado: false, variante: "secondary" };
  }

  const emprestimo = emprestimoDoEquipamento(emprestimos, equipamento.id);
  if (emprestimo) {
    return emprestimo.pessoa === pessoa
      ? { rotulo: "Está com você", habilitado: false, variante: "secondary" }
      : { rotulo: "Emprestado", habilitado: false, variante: "secondary" };
  }

  if (emprestimoEmAtraso(emprestimos, pessoa, hoje)) {
    return { rotulo: "Bloqueado por atraso", habilitado: false, variante: "secondary" };
  }

  if (atingiuLimite(emprestimos, pessoa)) {
    return { rotulo: "Limite de 3 itens", habilitado: false, variante: "secondary" };
  }

  return { rotulo: "Solicitar empréstimo", habilitado: true, variante: "primary" };
}

/** Linha de detalhe do card (min-height 18px no layout). */
export function detalheDoCard(
  equipamento: Equipamento,
  emprestimos: Emprestimo[],
): string {
  if (equipamento.situacao === "manutencao") {
    return equipamento.observacao ?? "Em manutenção";
  }
  const emprestimo = emprestimoDoEquipamento(emprestimos, equipamento.id);
  if (emprestimo) {
    return `Com ${emprestimo.pessoa} · devolver até ${formatarData(emprestimo.devolverAte)}`;
  }
  return "Pronto para retirada no balcão";
}
