/** @type {import('tailwindcss').Config} */
/* eslint-disable */

const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [`./pages/**/*.html`],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        h1: { fontSize: theme("fontSize.2xl"), fontWeight: "bold" },
        h2: { fontSize: theme("fontSize.lg"), fontWeight: "bold", marginTop: "2rem" },
      });
    }),
  ],
};
