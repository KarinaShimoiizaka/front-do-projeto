import { ErroDaApi, criarApi } from "./api";

function resposta(status: number, corpo: unknown): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => corpo } as unknown as Response;
}

describe("FE-04 lib/api", () => {
  it("FE-04 CA-10: envia o token da sessão no Authorization", async () => {
    const buscar = jest.fn(async () => resposta(200, []));
    const api = criarApi("http://localhost:3001/", async () => "token-da-sessao", buscar);

    await api.equipamentos();

    expect(buscar).toHaveBeenCalledWith(
      "http://localhost:3001/api/equipamentos",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token-da-sessao" }),
      }),
    );
  });

  it("FE-04 CA-10: resposta de erro vira exceção com o código e a mensagem do servidor", async () => {
    const buscar = jest.fn(async () =>
      resposta(422, { erro: "LIMITE_ATINGIDO", mensagem: "Você já está com 5 itens.", status: 422 }),
    );
    const api = criarApi("http://api", async () => "t", buscar);

    const recusa = api.solicitar("q1");
    await expect(recusa).rejects.toBeInstanceOf(ErroDaApi);
    await expect(recusa).rejects.toMatchObject({
      codigo: "LIMITE_ATINGIDO",
      mensagem: "Você já está com 5 itens.",
      status: 422,
    });
    expect(buscar).toHaveBeenCalledWith(
      "http://api/api/emprestimos",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ equipamentoId: "q1" }) }),
    );
  });

  it("sem conexão com o servidor, a exceção diz isso", async () => {
    const api = criarApi("http://api", async () => "t", async () => Promise.reject(new TypeError("Failed to fetch")));
    await expect(api.meusEmprestimos()).rejects.toMatchObject({ codigo: "SEM_CONEXAO", status: 0 });
  });
});
