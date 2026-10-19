import type { Metadata } from "next";

import { MolduraDeAutenticacao } from "@/components/MolduraDeAutenticacao";
import { FormularioDeLogin } from "./FormularioDeLogin";

export const metadata: Metadata = { title: "Entrar · EMPREST.AI" };

/** Tela de login (FE-03). A moldura é servidor; só o formulário é cliente. */
export default function Login() {
  return (
    <MolduraDeAutenticacao>
      <FormularioDeLogin />
    </MolduraDeAutenticacao>
  );
}
