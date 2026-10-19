import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proteção de rotas (FE-03 §6), primeira das três camadas.
 *
 * Esta camada existe para a tela não piscar antes do redirect. Ela NÃO é a
 * proteção do dado — isso é o guard do Nest e o RLS. Nada aqui deve ser
 * tratado como suficiente.
 */
export async function middleware(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (novos) => {
          novos.forEach(({ name, value }) => request.cookies.set(name, value));
          resposta = NextResponse.next({ request });
          novos.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ehLogin = request.nextUrl.pathname.startsWith("/login");

  if (!user && !ehLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && ehLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return resposta;
}

export const config = {
  // Fora: arquivos estáticos e imagens, que não têm o que proteger.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
