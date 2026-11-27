// Theme colors are stored as RGB numbers in index.css, so Tailwind can apply opacity (bg-accent/10).
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        page: token("--color-page"),
        surface: token("--color-surface"),
        ink: token("--color-ink"),
        muted: token("--color-muted"),
        accent: token("--color-accent"),
        violet: token("--color-violet"),
        rule: token("--color-rule"),
        danger: token("--color-danger"),
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        script: ["Caveat", "cursive"],
      },
      boxShadow: {
        glow: "0 0 40px rgb(var(--color-accent) / 0.35)",
      },
    },
  },
  plugins: [],
};
