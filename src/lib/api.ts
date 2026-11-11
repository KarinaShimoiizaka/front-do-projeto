import { clienteDoNavegador } from "./supabase/cliente-navegador";
import type { EmprestimoCriadoDaApi, EquipamentoDaApi, MeuEmprestimoDaApi } from "./tipos";

/**
 * Cliente HTTP do backend (FE-01 §6): base em NEXT_PUBLIC_API_URL, token da
 * sessão no Authorization e erro traduzido em exceção com a mensagem do
 * servidor. Não decide regra.
 */

export class ErroDaApi extends Error {
  constructor(
    readonly codigo: string,
    readonly mensagem: string,
    readonly status: number,
  ) {
    super(mensagem);
    this.name = "ErroDaApi";
  }
}

export type ApiDoEmprestai = {
  equipamentos(): Promise<EquipamentoDaApi[]>;
  meusEmprestimos(): Promise<MeuEmprestimoDaApi[]>;
  solicitar(equipamentoId: string): Promise<EmprestimoCriadoDaApi>;
};

const FALHA_GENERICA = "Algo deu errado. Tente de novo.";
const SEM_CONEXAO = "Não foi possível falar com o servidor. Tente de novo.";

type Buscar = (url: string, opcoes: RequestInit) => Promise<Response>;

export function criarApi(
  base: string,
  obterToken: () => Promise<string | null>,
  buscar: Buscar = (url, opcoes) => fetch(url, opcoes),
): ApiDoEmprestai {
  const raiz = base.replace(/\/+$/, "");

  async function chamar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
    const token = await obterToken();
    let resposta: Response;
    try {
      resposta = await buscar(`${raiz}${caminho}`, {
        ...opcoes,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      throw new ErroDaApi("SEM_CONEXAO", SEM_CONEXAO, 0);
    }

    const corpo = (await resposta.json().catch(() => null)) as { erro?: string; mensagem?: string } | null;
    if (!resposta.ok) {
      throw new ErroDaApi(corpo?.erro ?? "ERRO_INTERNO", corpo?.mensagem ?? FALHA_GENERICA, resposta.status);
    }
    return corpo as T;
  }

  return {
    equipamentos: () => chamar<EquipamentoDaApi[]>("/api/equipamentos"),
    meusEmprestimos: () => chamar<MeuEmprestimoDaApi[]>("/api/emprestimos/meus"),
    solicitar: (equipamentoId) =>
      chamar<EmprestimoCriadoDaApi>("/api/emprestimos", {
        method: "POST",
        body: JSON.stringify({ equipamentoId }),
      }),
  };
}

/** A API com o token da sessão do Supabase no navegador. */
export function apiDoNavegador(): ApiDoEmprestai {
  return criarApi(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001", async () => {
    const { data } = await clienteDoNavegador().auth.getSession();
    return data.session?.access_token ?? null;
  });
}

/** A frase que a tela mostra para qualquer falha: a do servidor, quando há. */
export function mensagemDoErro(erro: unknown): string {
  return erro instanceof ErroDaApi ? erro.mensagem : FALHA_GENERICA;
}
