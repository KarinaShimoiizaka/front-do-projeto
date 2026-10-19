import { redirect } from "next/navigation";

import { CatalogoInterativo } from "./CatalogoInterativo";
import { pessoaLogada } from "@/lib/sessao";

/**
 * Catálogo — tela de entrada de quem faz login (FE-02).
 *
 * Server Component: busca a sessão e passa para o miolo interativo. O
 * middleware já barra quem não tem sessão; o `redirect` aqui é a segunda
 * checagem, para o caso de a rota ser alcançada por outro caminho.
 */
export default async function Pagina() {
  const pessoa = await pessoaLogada();
  if (!pessoa) redirect("/login");

  return <CatalogoInterativo pessoa={pessoa} />;
}
