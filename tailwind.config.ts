import type { Config } from "tailwindcss";

/**
 * Tailwind consome os tokens do Nocturne declarados em src/app/globals.css.
 * Nenhum valor de cor, raio ou espaçamento é redefinido aqui — só apontado,
 * para que exista uma única fonte de verdade (o `:root`).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        divider: "var(--color-divider)",
        neutral900: "var(--color-neutral-900)",
        accent: {
          DEFAULT: "var(--color-accent)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      // Escala do Nocturne em densidade 0.70x.
      spacing: {
        "1n": "2.8px",
        "2n": "5.6px",
        "3n": "8.4px",
        "4n": "11.2px",
        "5n": "16.8px",
        "6n": "22.4px",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)",
      },
      boxShadow: {
        "elev-sm": "var(--shadow-sm)",
        "elev-md": "var(--shadow-md)",
        "elev-lg": "var(--shadow-lg)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        fadeUp: "fadeUp .25s ease both",
        "fadeUp-modal": "fadeUp .18s ease both",
        "fadeUp-toast": "fadeUp .2s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
