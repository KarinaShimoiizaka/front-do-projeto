import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente do Supabase para o navegador.
 *
 * Só recebe variáveis públicas (secrets.md §Classificação). A chave secreta
 * do Supabase nunca chega aqui — nem com prefixo NEXT_PUBLIC_, nem para
 * testar.
 */
export function clienteDoNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
