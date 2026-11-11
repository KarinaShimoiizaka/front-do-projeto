import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
}));
jest.mock("@/lib/supabase/cliente-navegador", () => ({ clienteDoNavegador: jest.fn() }));

import { ErroDaApi, type ApiDoEmprestai } from "@/lib/api";
import type { EquipamentoDaApi, MeuEmprestimoDaApi } from "@/lib/tipos";
import { CatalogoInterativo } from "./CatalogoInterativo";

const PESSOA = { nome: "Ana Ribeiro", iniciais: "AR", papel: "colaborador" as const };
// Segunda, 09/11/2026, 12:00 em São Paulo.
const AGORA = () => new Date("2026-11-09T15:00:00Z");

function equipamento(extra: Partial<EquipamentoDaApi> = {}): EquipamentoDaApi {
  return {
    id: "q1",
    patrimonio: "TI-0001",
    nome: "Notebook 14 polegadas",
    categoria: "notebook",
    situacao: "disponivel",
    observacao: null,
    imagemUrl: null,
    emprestimo: null,
    ...extra,
  };
}

const MEU: MeuEmprestimoDaApi = {
  id: "e1",
  retiradaEm: "2026-11-09",
  devolverAte: "2026-11-27",
  equipamento: { id: "q1", patrimonio: "TI-0001", nome: "Notebook 14 polegadas", categoria: "notebook", imagemUrl: null },
};

async function abrirEConfirmar() {
  await userEvent.click(await screen.findByRole("button", { name: "Solicitar empréstimo" }));
  const dialogo = screen.getByRole("dialog");
  await userEvent.click(within(dialogo).getByRole("button", { name: "Confirmar empréstimo" }));
  return dialogo;
}

describe("FE-04 solicitar no catálogo", () => {
  it("FE-04 CA-5: confirmar chama POST /emprestimos; com sucesso o card vira Está com você e o toast traz a data do servidor", async () => {
    // O servidor devolve uma data DIFERENTE da que o front calcula para o
    // modal (27/11). Assim o teste prova que o toast mostra a do servidor,
    // e não a calculada localmente (achado da rodada 1 do verificador).
    const DO_SERVIDOR = "2026-11-30";
    let emprestado = false;
    let liberar!: (valor: Awaited<ReturnType<ApiDoEmprestai["solicitar"]>>) => void;
    const api: ApiDoEmprestai = {
      equipamentos: jest.fn(async () => [
        emprestado
          ? equipamento({
              situacao: "emprestado",
              emprestimo: { pessoa: "Ana Ribeiro", devolverAte: DO_SERVIDOR, comVoce: true },
            })
          : equipamento(),
      ]),
      meusEmprestimos: jest.fn(async () => (emprestado ? [{ ...MEU, devolverAte: DO_SERVIDOR }] : [])),
      solicitar: jest.fn(() => new Promise((resolver) => (liberar = resolver))),
    };

    render(<CatalogoInterativo pessoa={PESSOA} api={api} agora={AGORA} />);

    await userEvent.click(await screen.findByRole("button", { name: "Solicitar empréstimo" }));
    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByText("27/11/2026")).toBeInTheDocument(); // 14 dias úteis
    await userEvent.click(within(dialogo).getByRole("button", { name: "Confirmar empréstimo" }));

    expect(api.solicitar).toHaveBeenCalledWith("q1");
    // Sem atualização otimista: enquanto o servidor não responde, o card não muda.
    expect(screen.getByRole("button", { name: "Solicitar empréstimo" })).toBeInTheDocument();

    emprestado = true;
    liberar({ id: "e1", equipamentoId: "q1", retiradaEm: "2026-11-09", devolverAte: DO_SERVIDOR });

    expect(await screen.findByRole("button", { name: "Está com você" })).toBeDisabled();
    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("Notebook 14 polegadas é seu até 30/11/2026");
    expect(toast).not.toHaveTextContent("27/11/2026");
  });

  it("FE-04 CA-6: quando o servidor recusa, a mensagem dele aparece e o card não muda", async () => {
    const api: ApiDoEmprestai = {
      equipamentos: jest.fn(async () => [equipamento()]),
      meusEmprestimos: jest.fn(async () => []),
      solicitar: jest.fn(async () => {
        throw new ErroDaApi("LIMITE_ATINGIDO", "Você já está com 5 itens.", 422);
      }),
    };

    render(<CatalogoInterativo pessoa={PESSOA} api={api} agora={AGORA} />);
    await abrirEConfirmar();

    expect(await screen.findByRole("status")).toHaveTextContent("Você já está com 5 itens.");
    expect(screen.getByRole("button", { name: "Solicitar empréstimo" })).toBeEnabled();
    expect(api.equipamentos).toHaveBeenCalledTimes(1);
  });
});
