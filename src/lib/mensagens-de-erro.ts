/**
 * Traduz a falha do Supabase para o que a pessoa lê (FE-03 §5).
 *
 * Credencial errada e e-mail inexistente produzem a MESMA mensagem: senão a
 * tela de login vira um verificador de quem trabalha aqui.
 */
export const ERRO_CREDENCIAL = "E-mail ou senha incorretos.";
export const ERRO_NAO_CONFIRMADO = "Confirme seu e-mail antes de entrar.";
export const ERRO_REDE = "Não foi possível conectar. Verifique sua internet.";
export const ERRO_GENERICO = "Não foi possível entrar. Tente de novo.";

export function mensagemDeLogin(codigo: string | undefined, texto: string): string {
  if (codigo === "email_not_confirmed") return ERRO_NAO_CONFIRMADO;
  if (codigo === "invalid_credentials") return ERRO_CREDENCIAL;

  const normalizado = texto.toLowerCase();
  if (normalizado.includes("email not confirmed")) return ERRO_NAO_CONFIRMADO;
  if (normalizado.includes("invalid login credentials")) return ERRO_CREDENCIAL;
  if (normalizado.includes("fetch") || normalizado.includes("network")) return ERRO_REDE;

  return ERRO_GENERICO;
}
