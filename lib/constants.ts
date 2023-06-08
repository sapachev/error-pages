import { Defaults } from "./interfaces.js";
import { DefaultPaths } from "./_constants.js";

export const DEFAULTS: Defaults = {
  ASSETS: DefaultPaths.ASSETS,
  CONFIG: DefaultPaths.CONFIG,
  DIST: DefaultPaths.DIST,
  PACKAGE: DefaultPaths.PACKAGE,
  SNIPPETS: DefaultPaths.SNIPPETS,
  SRC: DefaultPaths.SRC,
  THEMES: DefaultPaths.THEMES,
  TAILWIND_IN: DefaultPaths.TAILWIND_IN,
  TAILWIND_OUT: DefaultPaths.TAILWIND_OUT,
};

export const MANDATORY_CONFIG_PROPS = ["locale", "theme", "tailwind"];

// Mapping between locales supported by the Typograf and this tool src locales
export const TYPOGRAF_LOCALES = new Map([
  ["de", "de"],
  ["en", "en-US"],
  ["ru", "ru"],
]);
