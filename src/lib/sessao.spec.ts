import type { User } from "@supabase/supabase-js";

import { iniciaisDe, pessoaDeUsuario } from "./sessao";

function usuario(extra: Partial<User> = {}): User {
  return {
    id: "3f1b9c4e-5a21-4d7b-9c88-0e2a6b7d1f40",
    email: "ana.ribeiro@empresa.com.br",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-09-01T00:00:00Z",
    ...extra,
  } as User;
}

describe("pessoaDeUsuario — mesmas regras da BE-02 §5, no cliente", () => {
  it("usa operacoes quando o app_metadata diz operacoes", () => {
    expect(pessoaDeUsuario(usuario({ app_metadata: { papel: "operacoes" } })).papel).toBe(
      "operacoes",
    );
  });

  it("cai para colaborador quando não há papel", () => {
    expect(pessoaDeUsuario(usuario()).papel).toBe("colaborador");
  });

  it("cai para colaborador quando o papel é desconhecido", () => {
    expect(
      pessoaDeUsuario(usuario({ app_metadata: { papel: "administrador" } })).papel,
    ).toBe("colaborador");
  });

  it("usa o nome do user_metadata quando ele existe", () => {
    expect(pessoaDeUsuario(usuario({ user_metadata: { nome: "Ana Ribeiro" } })).nome).toBe(
      "Ana Ribeiro",
    );
  });

  it("usa a parte local do e-mail quando não há nome", () => {
    expect(pessoaDeUsuario(usuario()).nome).toBe("ana.ribeiro");
  });
});

describe("iniciaisDe", () => {
  it("junta a primeira letra do primeiro e do último nome", () => {
    expect(iniciaisDe("Ana Ribeiro")).toBe("AR");
  });

  it("ignora nomes do meio", () => {
    expect(iniciaisDe("Ana Clara de Souza Ribeiro")).toBe("AR");
  });

  it("usa duas letras quando há um nome só", () => {
    expect(iniciaisDe("ana.ribeiro")).toBe("AN");
  });
});
