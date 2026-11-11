export type Categoria = "Notebook" | "Monitor" | "Cabo" | "Câmera" | "Acessório";

export type SituacaoEquipamento = "disponivel" | "emprestado" | "manutencao";

/** Quem está com o item e até quando (o PRD pede no card). */
export type EmprestimoDoItem = {
  pessoa: string;
  /** ISO `AAAA-MM-DD`. */
  devolverAte: string;
  /** O item está com a própria pessoa logada. */
  comVoce: boolean;
};

export type Equipamento = {
  id: string;
  nome: string;
  categoria: Categoria;
  patrimonio: string;
  situacao: SituacaoEquipamento;
  /** Só em manutenção: o que há de errado com o item. */
  observacao?: string | null;
  /** URL pública da foto (800×600), ou nula se o item não tem foto. */
  imagemUrl?: string | null;
  emprestimo?: EmprestimoDoItem | null;
};

/** Um empréstimo em aberto da própria pessoa logada. */
export type MeuEmprestimo = {
  id: string;
  /** ISO `AAAA-MM-DD`. */
  retiradaEm: string;
  /** ISO `AAAA-MM-DD`. Retirada + 14 dias úteis. */
  devolverAte: string;
  equipamento: {
    id: string;
    patrimonio: string;
    nome: string;
    categoria: Categoria;
    imagemUrl: string | null;
  };
};

export type EstadoPrazo = "em-dia" | "a-vencer" | "atrasado";

export type Filtro = "todos" | "disponiveis" | "emprestados" | "manutencao";

// --- O que a API devolve (BE-04 §3) -------------------------------------

export type EquipamentoDaApi = {
  id: string;
  patrimonio: string;
  nome: string;
  categoria: string;
  situacao: SituacaoEquipamento;
  observacao: string | null;
  imagemUrl: string | null;
  emprestimo: EmprestimoDoItem | null;
};

export type MeuEmprestimoDaApi = {
  id: string;
  retiradaEm: string;
  devolverAte: string;
  equipamento: {
    id: string;
    patrimonio: string;
    nome: string;
    categoria: string;
    imagemUrl: string | null;
  };
};

export type EmprestimoCriadoDaApi = {
  id: string;
  equipamentoId: string;
  retiradaEm: string;
  devolverAte: string;
};
