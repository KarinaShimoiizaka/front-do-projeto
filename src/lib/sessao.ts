import type { User } from "@supabase/supabase-js";

import { clienteDoServidor } from "./supabase/cliente-servidor";

export type Papel = "colaborador" | "operacoes";

export type PessoaLogada = {
  nome: string;
  iniciais: string;
  papel: Papel;
};

/**
 * Traduz o usuário do Supabase para o que a interface precisa.
 *
 * As mesmas regras da BE-02 §5, do lado do cliente: papel ausente ou
 * desconhecido vale `colaborador`, e nome ausente vira a parte local do
 * e-mail. As duas pontas precisam concordar — se divergirem, a barra de
 * navegação mostra abas que a API recusa.
 */
export function pessoaDeUsuario(usuario: User): PessoaLogada {
  const email = usuario.email ?? "";
  const parteLocal = email.slice(0, email.indexOf("@")) || "pessoa";

  const nomeBruto = usuario.user_metadata?.nome;
  const nome =
    typeof nomeBruto === "string" && nomeBruto.trim().length > 0
      ? nomeBruto.trim()
      : parteLocal;

  const papelBruto = usuario.app_metadata?.papel;
  const papel: Papel = papelBruto === "operacoes" ? "operacoes" : "colaborador";

  return { nome, iniciais: iniciaisDe(nome), papel };
}

export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "??";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Devolve quem está logado, ou `null`. Usado pelos Server Components. */
export async function pessoaLogada(): Promise<PessoaLogada | null> {
  const supabase = await clienteDoServidor();
  const { data } = await supabase.auth.getUser();
  return data.user ? pessoaDeUsuario(data.user) : null;
}
