import { temErro, validarLogin } from "./validacao-login";

describe("validarLogin (FE-03 §3)", () => {
  it("aceita e-mail e senha preenchidos", () => {
    const erros = validarLogin("ana@empresa.com.br", "qualquercoisa");

    expect(temErro(erros)).toBe(false);
  });

  it("cobra o e-mail quando ele vem vazio", () => {
    expect(validarLogin("   ", "senha123").email).toBe("Informe seu e-mail.");
  });

  it("cobra o formato quando o e-mail não tem arroba", () => {
    expect(validarLogin("ana.empresa.com.br", "senha123").email).toBe(
      "E-mail em formato inválido.",
    );
  });

  it("cobra a senha quando ela vem vazia", () => {
    expect(validarLogin("ana@empresa.com.br", "").senha).toBe("Informe sua senha.");
  });

  it("não exige comprimento mínimo de senha no login", () => {
    const erros = validarLogin("ana@empresa.com.br", "a");

    expect(erros.senha).toBeUndefined();
    expect(temErro(erros)).toBe(false);
  });
});
