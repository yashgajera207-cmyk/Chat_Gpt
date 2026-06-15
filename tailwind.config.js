
/** @type {import('tailwindcss').Config} */

module.exports = {

  // =========================
  // DARK MODE
  // =========================

  darkMode: "class",

  // =========================
  // CONTENT PATHS
  // =========================

  content: [

    "./pages/**/*.{js,ts,jsx,tsx,mdx}",

    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    "./app/**/*.{js,ts,jsx,tsx,mdx}",

    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // =========================
  // THEME
  // =========================

  theme: {

    extend: {

      colors: {

        primary: {
          DEFAULT: "#6366f1",
        },

        secondary: {
          DEFAULT: "#8b5cf6",
        },
      },

      backdropBlur: {
        xs: "2px",
      },

      boxShadow: {

        soft:
          "0 4px 20px rgba(0,0,0,0.08)",

        dark:
          "0 4px 20px rgba(0,0,0,0.4)",
      },

      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },

  // =========================
  // PLUGINS
  // =========================

  plugins: [],
};

