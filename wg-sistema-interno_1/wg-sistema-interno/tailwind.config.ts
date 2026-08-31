import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#E8EDE9",
        surface: "#FFFFFF",
        ink: "#1B2321",
        muted: "#5B6660",
        border: "#D3D8D2",
        gold: "#C98A2B",
        teal: "#2F6F62",
        danger: "#B23B3B",
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
