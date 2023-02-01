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
  TAILWIND_ENTRY: DefaultPaths.TAILWIND_ENTRY,
};

export const MANDATORY_CONFIG_PROPS = ["locale", "theme", "tailwind"];

export const CONSOLE_COLORS = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",
  FgGray: "\x1b[90m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
  BgGray: "\x1b[100m",
};
