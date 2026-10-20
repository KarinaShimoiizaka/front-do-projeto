import { Marca } from "./Marca";

const ESTATISTICAS = [
  { numero: "3", texto: "itens por pessoa" },
  { numero: "14", texto: "dias de prazo" },
  { numero: "0", texto: "linhas para preencher" },
];

/**
 * Coluna esquerda da tela de entrada, conforme o PRD §5.1.
 *
 * A tela ocupa exatamente a altura da janela e não rola — diverge de
 * propósito da altura mínima de 820px do PRD. Abaixo de `lg` as duas colunas
 * empilhadas não caberiam, então só o formulário aparece.
 */
export function MolduraDeAutenticacao({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-dvh grid-cols-1 overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
      <section
        className="relative hidden overflow-hidden px-14 py-16 lg:block"
        style={{ background: "linear-gradient(160deg,#1b1f2e,#161826 60%)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 520,
            height: 520,
            left: -160,
            top: 120,
            background:
              "radial-gradient(circle, rgba(47,184,172,0.16) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex h-full flex-col">
          <Marca tamanho={17} />

          <h1 className="mt-16 text-[44px]">
            Equipamento de TI
            <br />
            sem planilha no meio.
          </h1>
          <p className="mt-4 max-w-[46ch] text-[16px] opacity-60">
            Peça o que precisa, veja o prazo e devolva no balcão. O acervo inteiro
            fica visível, inclusive o que está com outra pessoa.
          </p>

          <div
            className="mt-auto flex gap-12 border-t pt-6"
            style={{ borderColor: "var(--color-divider)" }}
          >
            {ESTATISTICAS.map((estatistica) => (
              <div key={estatistica.texto}>
                <p className="text-[30px]" style={{ color: "var(--color-accent)" }}>
                  {estatistica.numero}
                </p>
                <p className="text-[12.5px] opacity-55">{estatistica.texto}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[12px] opacity-40">Operações · TI interno</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-8 sm:px-14">
        <div className="w-full max-w-[340px]">{children}</div>
      </section>
    </div>
  );
}
