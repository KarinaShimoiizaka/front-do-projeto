import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FormularioDeLogin } from "./FormularioDeLogin";

const entrar = jest.fn();
const trocarDeRota = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: trocarDeRota, refresh: jest.fn() }),
}));

jest.mock("@/lib/supabase/cliente-navegador", () => ({
  clienteDoNavegador: () => ({ auth: { signInWithPassword: entrar } }),
}));

beforeEach(() => {
  entrar.mockReset();
  trocarDeRota.mockReset();
  entrar.mockResolvedValue({ error: null });
});

describe("FormularioDeLogin (FE-03 §§3-5)", () => {
  it("não chama o Supabase quando o e-mail está em branco", async () => {
    render(<FormularioDeLogin />);

    await userEvent.type(screen.getByLabelText("Senha"), "senha123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(entrar).not.toHaveBeenCalled();
  });

  it("não chama o Supabase quando a senha está em branco", async () => {
    render(<FormularioDeLogin />);

    await userEvent.type(screen.getByLabelText("E-mail"), "ana@empresa.com.br");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Informe sua senha.")).toBeInTheDocument();
    expect(entrar).not.toHaveBeenCalled();
  });

  it("marca o campo inválido para leitores de tela", async () => {
    render(<FormularioDeLogin />);

    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "true"),
    );
  });

  it("envia as credenciais quando os campos estão preenchidos", async () => {
    render(<FormularioDeLogin />);

    await userEvent.type(screen.getByLabelText("E-mail"), " ana@empresa.com.br ");
    await userEvent.type(screen.getByLabelText("Senha"), "senha123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(entrar).toHaveBeenCalledWith({
        email: "ana@empresa.com.br",
        password: "senha123",
      }),
    );
    expect(trocarDeRota).toHaveBeenCalledWith("/");
  });

  it("mostra a mensagem e preserva o que foi digitado quando a senha é recusada", async () => {
    entrar.mockResolvedValue({
      error: { code: "invalid_credentials", message: "Invalid login credentials" },
    });
    render(<FormularioDeLogin />);

    await userEvent.type(screen.getByLabelText("E-mail"), "ana@empresa.com.br");
    await userEvent.type(screen.getByLabelText("Senha"), "errada");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "E-mail ou senha incorretos.",
    );
    expect(screen.getByLabelText("E-mail")).toHaveValue("ana@empresa.com.br");
    expect(screen.getByLabelText("Senha")).toHaveValue("errada");
    expect(trocarDeRota).not.toHaveBeenCalled();
  });

  it("desabilita o botão enquanto envia, para não aceitar duplo clique", async () => {
    let liberar: (valor: { error: null }) => void = () => undefined;
    entrar.mockReturnValue(new Promise((resolve) => (liberar = resolve)));
    render(<FormularioDeLogin />);

    await userEvent.type(screen.getByLabelText("E-mail"), "ana@empresa.com.br");
    await userEvent.type(screen.getByLabelText("Senha"), "senha123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const botao = await screen.findByRole("button", { name: "Entrando…" });
    expect(botao).toBeDisabled();

    liberar({ error: null });
    await waitFor(() => expect(entrar).toHaveBeenCalledTimes(1));
  });

  it("não oferece caminho de cadastro, que está fora da v1", () => {
    render(<FormularioDeLogin />);

    expect(screen.queryByText(/criar conta/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/esqueci minha senha/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/entrar como opera/i)).not.toBeInTheDocument();
  });
});
