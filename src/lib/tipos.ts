export type Categoria = "Notebook" | "Monitor" | "Cabo" | "Câmera" | "Acessório";

export type SituacaoEquipamento = "disponivel" | "emprestado" | "manutencao";

export type Equipamento = {
  id: string;
  nome: string;
  categoria: Categoria;
  patrimonio: string;
  situacao: SituacaoEquipamento;
  /** Só em manutenção: o que há de errado com o item. */
  observacao?: string;
};

export type Emprestimo = {
  id: string;
  equipamentoId: string;
  pessoa: string;
  /** ISO `AAAA-MM-DD`. */
  retiradaEm: string;
  /** ISO `AAAA-MM-DD`. Retirada + 14 dias. */
  devolverAte: string;
};

export type EstadoPrazo = "em-dia" | "a-vencer" | "atrasado";

export type Filtro = "todos" | "disponiveis" | "emprestados" | "manutencao";
