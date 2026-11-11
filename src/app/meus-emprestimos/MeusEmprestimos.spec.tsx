import { render, screen, within } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
}));
jest.mock("@/lib/supabase/cliente-navegador", () => ({ clienteDoNavegador: jest.fn() }));

import type { ApiDoEmprestai } from "@/lib/api";
import type { MeuEmprestimoDaApi } from "@/lib/tipos";
import { MeusEmprestimos } from "./MeusEmprestimos";

const PESSOA = { nome: "Ana Ribeiro", iniciais: "AR", papel: "colaborador" as const };
const AGORA = () => new Date("2026-11-09T15:00:00Z");

function emprestimo(id: string, nome: string, devolverAte: string): MeuEmprestimoDaApi {
  return {
    id,
    retiradaEm: "2026-11-09",
    devolverAte,
    equipamento: { id: `q-${id}`, patrimonio: `TI-${id}`, nome, categoria: "notebook", imagemUrl: null },
  };
}

function api(meus: MeuEmprestimoDaApi[]): ApiDoEmprestai {
  return {
    equipamentos: jest.fn(async () => []),
    meusEmprestimos: jest.fn(async () => meus),
    solicitar: jest.fn(),
  };
}

describe("FE-04 Meus empréstimos", () => {
  it("FE-04 CA-7: lista os empréstimos em aberto com a data de devolução em DD/MM/AAAA", async () => {
    render(
      <MeusEmprestimos
        pessoa={PESSOA}
        agora={AGORA}
        api={api([emprestimo("0001", "Notebook 14 polegadas", "2026-11-27"), emprestimo("0008", "Cabo HDMI 2 m", "2026-11-30")])}
      />,
    );

    const lista = await screen.findByRole("list", { name: "Empréstimos em aberto" });
    const linhas = within(lista).getAllByRole("listitem");
    expect(linhas).toHaveLength(2);
    expect(linhas[0]).toHaveTextContent("Notebook 14 polegadas");
    expect(linhas[0]).toHaveTextContent("Devolver até27/11/2026");
    expect(linhas[1]).toHaveTextContent("30/11/2026");
    expect(screen.queryByRole("button", { name: /devolver/i })).not.toBeInTheDocument();
  });

  it("FE-04 CA-7: sem nenhum empréstimo, mostra o estado vazio com Ir ao catálogo", async () => {
    render(<MeusEmprestimos pessoa={PESSOA} agora={AGORA} api={api([])} />);

    expect(await screen.findByText("Você não tem nenhum empréstimo em aberto.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir ao catálogo" })).toHaveAttribute("href", "/");
  });

  it("FE-04 CA-8: o cabeçalho diz N de 5 itens em seu nome e o prazo de 14 dias úteis", async () => {
    render(
      <MeusEmprestimos
        pessoa={PESSOA}
        agora={AGORA}
        api={api([emprestimo("0001", "Notebook 14 polegadas", "2026-11-27"), emprestimo("0008", "Cabo HDMI 2 m", "2026-11-30")])}
      />,
    );

    expect(await screen.findByText(/itens em seu nome/)).toHaveTextContent(
      "2 de 5 itens em seu nome · prazo padrão de 14 dias úteis",
    );
  });
});
