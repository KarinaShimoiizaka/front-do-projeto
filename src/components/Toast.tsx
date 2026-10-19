"use client";

import { useEffect } from "react";

/** Sai automaticamente em 2600ms (PRD, seção 5.6). */
const DURACAO_MS = 2600;

export function Toast({ texto, aoSumir }: { texto: string; aoSumir: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(aoSumir, DURACAO_MS);
    return () => window.clearTimeout(id);
  }, [texto, aoSumir]);

  return (
    <div
      role="status"
      className="animate-fadeUp-toast fixed bottom-[28px] left-1/2 z-50 -translate-x-1/2
        rounded-[999px] border px-5 py-3 text-[13.5px]"
      style={{
        background: "var(--color-accent-900)",
        borderColor: "var(--color-accent-700)",
        color: "var(--color-accent-200)",
      }}
    >
      {texto}
    </div>
  );
}
