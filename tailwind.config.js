/** @type {import('tailwindcss').Config} */

const { DefaultPaths } = require("./lib/_constants");
const config = require('./config');

console.log(config.theme);
const { theme } = require(`${DefaultPaths.THEMES}/${config.theme}/theme.tailwind.config.js`);
console.log(theme);

module.exports = {
  content: [
    `${DefaultPaths.DIST}/**/*.html`,
  ],
  theme,
  plugins: [],
}
