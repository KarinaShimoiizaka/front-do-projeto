import type { SituacaoEquipamento } from "@/lib/tipos";

const ESTILO: Record<SituacaoEquipamento, { rotulo: string; fg: string; bg: string; bd: string }> = {
  disponivel: { rotulo: "Disponível", fg: "var(--st-ok-fg)", bg: "var(--st-ok-bg)", bd: "var(--st-ok-bd)" },
  emprestado: { rotulo: "Emprestado", fg: "var(--st-warn-fg)", bg: "var(--st-warn-bg)", bd: "var(--st-warn-bd)" },
  manutencao: { rotulo: "Em manutenção", fg: "var(--st-off-fg)", bg: "var(--st-off-bg)", bd: "var(--st-off-bd)" },
};

export function Pill({ situacao }: { situacao: SituacaoEquipamento }) {
  const { rotulo, fg, bg, bd } = ESTILO[situacao];
  return (
    <span className="pill" style={{ color: fg, background: bg, borderColor: bd }}>
      {rotulo}
    </span>
  );
}
