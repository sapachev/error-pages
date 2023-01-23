/** @type {import('tailwindcss').Config} */

const { DefaultPaths } = require("./lib/_constants");
const config = require('./config');

const { theme } = require(`${DefaultPaths.THEMES}/${config.theme}/theme.tailwind.config.js`);

module.exports = {
  content: [
    `${DefaultPaths.DIST}/**/*.html`,
  ],
  theme,
  plugins: [],
}
