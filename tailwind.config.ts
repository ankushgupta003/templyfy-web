import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./shared/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111F",
        electric: "#2563EB",
        emerald: "#10B981",
        cyan: "#06B6D4",
        slateText: "#334155",
        cloud: "#F8FAFC",
        amber: "#F59E0B",
      },
      boxShadow: {
        soft: "0 24px 60px rgba(8, 17, 31, 0.14)",
        panel: "0 12px 30px rgba(8, 17, 31, 0.10)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(37, 99, 235, 0.18), transparent 24%), linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        "hero-grid": "100% 100%, 32px 32px, 32px 32px",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
