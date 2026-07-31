import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0B0C10",   // quase-preto, fundo principal
          raised: "#15171D",    // superfícies elevadas (cards)
          line: "#23262F",      // bordas/divisores
        },
        volt: {
          DEFAULT: "#D6FF3F",   // amarelo-verde elétrico — assinatura da marca
          dim: "#A8CC2F",
        },
        signal: {
          DEFAULT: "#FF4B2B",   // vermelho-laranja (herança Fortrek) — usado com moderação
        },
        ink: {
          DEFAULT: "#F4F5F0",   // texto principal (quase-branco quente)
          muted: "#9A9DA6",     // texto secundário
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
