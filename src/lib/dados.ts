import type { Emprestimo, Equipamento } from "./tipos";

/**
 * Dados de exemplo do PRD (seção 9), para reproduzir as telas fielmente.
 * Substituir pela API do backend quando ela existir.
 */

export const USUARIO = { nome: "Ana Ribeiro", iniciais: "AR", papel: "Colaborador" } as const;

/** Data de referência do PRD — fixa, para que os estados batam com a especificação. */
export const HOJE = "2026-08-31";

export const EQUIPAMENTOS: Equipamento[] = [
  { id: "eq-1", nome: "Notebook Dell Latitude 5450", categoria: "Notebook", patrimonio: "TI-0142", situacao: "disponivel" },
  { id: "eq-2", nome: "MacBook Pro 14 M3", categoria: "Notebook", patrimonio: "TI-0088", situacao: "emprestado" },
  { id: "eq-3", nome: 'Monitor LG 27" 4K', categoria: "Monitor", patrimonio: "TI-0231", situacao: "disponivel" },
  { id: "eq-4", nome: 'Monitor Dell 24" FHD', categoria: "Monitor", patrimonio: "TI-0233", situacao: "manutencao", observacao: "Painel com falha, retorna em 05/09" },
  { id: "eq-5", nome: "Câmera Sony ZV-1", categoria: "Câmera", patrimonio: "TI-0301", situacao: "emprestado" },
  { id: "eq-6", nome: "Cabo HDMI 2.1 3m", categoria: "Cabo", patrimonio: "TI-0455", situacao: "disponivel" },
  { id: "eq-7", nome: "Dock Thunderbolt 4", categoria: "Acessório", patrimonio: "TI-0512", situacao: "emprestado" },
  { id: "eq-8", nome: "Tripé Manfrotto Befree", categoria: "Acessório", patrimonio: "TI-0318", situacao: "manutencao", observacao: "Trava do centro quebrada" },
  { id: "eq-9", nome: "Headset Jabra Evolve2", categoria: "Acessório", patrimonio: "TI-0402", situacao: "disponivel" },
];

export const EMPRESTIMOS: Emprestimo[] = [
  { id: "emp-1", equipamentoId: "eq-5", pessoa: "Ana Ribeiro", retiradaEm: "2026-08-29", devolverAte: "2026-09-12" },
  { id: "emp-2", equipamentoId: "eq-7", pessoa: "Ana Ribeiro", retiradaEm: "2026-08-22", devolverAte: "2026-09-05" },
  { id: "emp-3", equipamentoId: "eq-2", pessoa: "Marcos Lemos", retiradaEm: "2026-08-24", devolverAte: "2026-09-07" },
];
