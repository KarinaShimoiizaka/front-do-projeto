import { redirect } from "next/navigation";

import { MeusEmprestimos } from "./MeusEmprestimos";
import { pessoaLogada } from "@/lib/sessao";

/**
 * Meus empréstimos (PRD §5.3, FE-04 §4). Server Component só para a sessão;
 * a lista é buscada no navegador, onde está o token.
 */
export default async function Pagina() {
  const pessoa = await pessoaLogada();
  if (!pessoa) redirect("/login");

  return <MeusEmprestimos pessoa={pessoa} />;
}
