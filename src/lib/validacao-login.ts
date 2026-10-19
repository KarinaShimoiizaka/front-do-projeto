/**
 * Validação do formulário de login (FE-03 §3).
 *
 * Existe só para evitar uma ida à rede que já se sabe inútil. A regra que
 * vale é a do Supabase — em especial, o comprimento mínimo da senha NÃO é
 * verificado aqui: no login isso só revelaria formato de senha a quem está
 * tentando adivinhar.
 */

const FORMATO_DE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ErrosDeLogin = {
  email?: string;
  senha?: string;
};

export function validarLogin(email: string, senha: string): ErrosDeLogin {
  const erros: ErrosDeLogin = {};

  const emailLimpo = email.trim();
  if (emailLimpo.length === 0) {
    erros.email = "Informe seu e-mail.";
  } else if (!FORMATO_DE_EMAIL.test(emailLimpo)) {
    erros.email = "E-mail em formato inválido.";
  }

  if (senha.length === 0) {
    erros.senha = "Informe sua senha.";
  }

  return erros;
}

export function temErro(erros: ErrosDeLogin): boolean {
  return Object.keys(erros).length > 0;
}
