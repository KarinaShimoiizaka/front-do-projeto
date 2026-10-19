/**
 * Marca EMPREST.AI: quadrado com borda no acento e um quadradinho preenchido
 * ao centro, seguido do nome (PRD, seção 4).
 */
export function Marca({ tamanho = 15 }: { tamanho?: number }) {
  const lado = tamanho + 8;
  return (
    <span className="flex items-center gap-[10px]">
      <span
        aria-hidden
        className="grid shrink-0 place-items-center rounded-[6px] border-[1.5px]"
        style={{ width: lado, height: lado, borderColor: "var(--color-accent)" }}
      >
        <span
          className="block rounded-[2px]"
          style={{ width: 8, height: 8, background: "var(--color-accent)" }}
        />
      </span>
      <span
        className="font-bold"
        style={{ fontSize: tamanho, letterSpacing: "0.02em" }}
      >
        EMPREST
        <span style={{ color: "var(--color-accent)" }}>.AI</span>
      </span>
    </span>
  );
}
