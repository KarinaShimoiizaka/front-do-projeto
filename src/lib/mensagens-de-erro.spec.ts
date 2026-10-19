import {
  ERRO_CREDENCIAL,
  ERRO_GENERICO,
  ERRO_NAO_CONFIRMADO,
  ERRO_REDE,
  mensagemDeLogin,
} from "./mensagens-de-erro";

describe("mensagemDeLogin (FE-03 §5)", () => {
  it("traduz credencial recusada", () => {
    expect(mensagemDeLogin("invalid_credentials", "Invalid login credentials")).toBe(
      ERRO_CREDENCIAL,
    );
  });

  it("traduz e-mail não confirmado", () => {
    expect(mensagemDeLogin("email_not_confirmed", "Email not confirmed")).toBe(
      ERRO_NAO_CONFIRMADO,
    );
  });

  it("traduz falha de rede", () => {
    expect(mensagemDeLogin(undefined, "TypeError: Failed to fetch")).toBe(ERRO_REDE);
  });

  it("cai na mensagem genérica quando não reconhece o erro", () => {
    expect(mensagemDeLogin(undefined, "algo estranho")).toBe(ERRO_GENERICO);
  });

  it("não distingue senha errada de e-mail inexistente", () => {
    const senhaErrada = mensagemDeLogin("invalid_credentials", "Invalid login credentials");
    const emailInexistente = mensagemDeLogin(
      "invalid_credentials",
      "Invalid login credentials",
    );

    expect(senhaErrada).toBe(emailInexistente);
  });
});
