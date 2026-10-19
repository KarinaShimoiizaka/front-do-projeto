"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { mensagemDeLogin } from "@/lib/mensagens-de-erro";
import { clienteDoNavegador } from "@/lib/supabase/cliente-navegador";
import { temErro, validarLogin, type ErrosDeLogin } from "@/lib/validacao-login";

export function FormularioDeLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<ErrosDeLogin>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroGeral(null);

    const encontrados = validarLogin(email, senha);
    setErros(encontrados);
    if (temErro(encontrados)) return;

    setEnviando(true);
    try {
      const { error } = await clienteDoNavegador().auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        // A senha NÃO é limpa: o erro pode não ter sido culpa de quem digitou.
        setErroGeral(mensagemDeLogin(error.code, error.message));
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (falha) {
      setErroGeral(mensagemDeLogin(undefined, String(falha)));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      <h2 className="text-[26px]">Entrar</h2>
      <p className="mt-2 text-[14px] opacity-60">
        Use o e-mail da empresa cadastrado por Operações.
      </p>

      <div className="mt-7 flex flex-col gap-4">
        <Campo
          id="email"
          rotulo="E-mail"
          tipo="email"
          valor={email}
          aoMudar={setEmail}
          erro={erros.email}
        />
        <Campo
          id="senha"
          rotulo="Senha"
          tipo="password"
          valor={senha}
          aoMudar={setSenha}
          erro={erros.senha}
        />
      </div>

      {erroGeral && (
        <p
          role="alert"
          className="mt-4 text-[12.5px]"
          style={{ color: "var(--st-late-fg)" }}
        >
          {erroGeral}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="btn btn-primary btn-block mt-6 h-10"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>

      <p className="mt-5 text-[12px] opacity-45">
        Cada pessoa vê apenas os próprios empréstimos.
      </p>
    </form>
  );
}

function Campo({
  id,
  rotulo,
  tipo,
  valor,
  aoMudar,
  erro,
}: {
  id: string;
  rotulo: string;
  tipo: "email" | "password";
  valor: string;
  aoMudar: (valor: string) => void;
  erro?: string;
}) {
  const idDoErro = `${id}-erro`;

  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className="text-[12.5px] opacity-70">
        {rotulo}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className="input"
        style={erro ? { borderColor: "var(--st-late-fg)" } : undefined}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idDoErro : undefined}
        autoComplete={tipo === "email" ? "email" : "current-password"}
      />
      {erro && (
        <p id={idDoErro} className="text-[12px]" style={{ color: "var(--st-late-fg)" }}>
          {erro}
        </p>
      )}
    </div>
  );
}
