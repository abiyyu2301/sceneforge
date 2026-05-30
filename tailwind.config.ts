import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#141414",
        card: "#1C1C1C",
        border: "#2A2A2A",
        "text-primary": "#F0F0F0",
        "text-secondary": "#888888",
        accent: "#00E599",
        "accent-hover": "#00CC88",
        error: "#FF4444",
        warning: "#F5A623",
        success: "#00CC88",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'card': '6px',
        'input': '4px',
        'badge': '999px',
      },
    },
  },
  plugins: [],
};
export default config;
