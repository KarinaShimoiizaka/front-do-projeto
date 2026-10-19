import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Cliente do Supabase para Server Components e middleware. */
export async function clienteDoServidor() {
  const armazem = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => armazem.getAll(),
        setAll: (novos) => {
          try {
            novos.forEach(({ name, value, options }) =>
              armazem.set(name, value, options),
            );
          } catch {
            // Server Component não pode escrever cookie; o middleware faz isso.
          }
        },
      },
    },
  );
}
