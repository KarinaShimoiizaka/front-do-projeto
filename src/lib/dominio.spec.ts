import {
  acaoDoCard,
  detalheDoCard,
  emprestimoEmAtraso,
  hojeEmSaoPaulo,
  somarDiasUteis,
} from "./dominio";
import type { Equipamento, MeuEmprestimo } from "./tipos";

const HOJE = "2026-11-09";

function item(extra: Partial<Equipamento> = {}): Equipamento {
  return {
    id: "q1",
    nome: "Notebook 14 polegadas",
    categoria: "Notebook",
    patrimonio: "TI-0001",
    situacao: "disponivel",
    observacao: null,
    imagemUrl: null,
    emprestimo: null,
    ...extra,
  };
}

function meus(n: number, devolverAte = "2026-11-27"): MeuEmprestimo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `e${i}`,
    retiradaEm: "2026-11-09",
    devolverAte,
    equipamento: { id: `x${i}`, patrimonio: `TI-90${i}`, nome: `Item ${i}`, categoria: "Cabo", imagemUrl: null },
  }));
}

describe("FE-04 regras do catálogo (lib/dominio)", () => {
  it("FE-04 CA-2: com 5 em aberto e sem atraso, o card disponível mostra Limite de 5 itens, desabilitado", () => {
    expect(acaoDoCard(item(), meus(5), HOJE)).toEqual({
      rotulo: "Limite de 5 itens",
      habilitado: false,
      variante: "secondary",
    });
  });

  it("FE-04 CA-2: com 4 em aberto, o card disponível mostra Solicitar empréstimo, habilitado", () => {
    expect(acaoDoCard(item(), meus(4), HOJE)).toEqual({
      rotulo: "Solicitar empréstimo",
      habilitado: true,
      variante: "primary",
    });
  });

  it("FE-04 CA-3: item em manutenção mostra Indisponível, desabilitado", () => {
    const acao = acaoDoCard(item({ situacao: "manutencao" }), [], HOJE);
    expect(acao).toMatchObject({ rotulo: "Indisponível", habilitado: false });
  });

  it("FE-04 CA-4: somar 14 dias úteis dá os três exemplos da BE-04 §4", () => {
    expect(somarDiasUteis("2026-11-09", 14)).toBe("2026-11-27");
    expect(somarDiasUteis("2026-11-13", 14)).toBe("2026-12-03");
    expect(somarDiasUteis("2026-11-14", 14)).toBe("2026-12-03");
  });

  it("a posse do item vence o limite: o que está com você mostra Está com você", () => {
    const meu = item({
      situacao: "emprestado",
      emprestimo: { pessoa: "Ana Ribeiro", devolverAte: "2026-11-27", comVoce: true },
    });
    expect(acaoDoCard(meu, meus(5), HOJE).rotulo).toBe("Está com você");
  });

  it("com outra pessoa: Emprestado, e o detalhe diz com quem e até quando", () => {
    const deOutro = item({
      situacao: "emprestado",
      emprestimo: { pessoa: "Bruno Lima", devolverAte: "2026-11-27", comVoce: false },
    });
    expect(acaoDoCard(deOutro, [], HOJE).rotulo).toBe("Emprestado");
    expect(detalheDoCard(deOutro)).toBe("Com Bruno Lima · devolver até 27/11/2026");
  });

  it("um item em atraso bloqueia: Bloqueado por atraso", () => {
    const atrasados = meus(1, "2026-11-06");
    expect(emprestimoEmAtraso(atrasados, HOJE)?.id).toBe("e0");
    expect(acaoDoCard(item(), atrasados, HOJE).rotulo).toBe("Bloqueado por atraso");
  });

  it("hoje é o dia em São Paulo", () => {
    expect(hojeEmSaoPaulo(new Date("2026-11-10T02:00:00Z"))).toBe("2026-11-09");
  });
});
