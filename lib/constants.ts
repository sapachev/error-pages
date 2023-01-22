import { Defaults } from './interfaces.js';
import { DefaultPaths } from './_constants.js';

export const DEFAULTS: Defaults = {
  CONFIG: DefaultPaths.CONFIG,
  SRC: DefaultPaths.SRC,
  DIST: DefaultPaths.DIST,
  THEMES: DefaultPaths.THEMES,
  TAILWIND_ENTRY: DefaultPaths.TAILWIND_ENTRY,
}

export const SRC_CODE_PATTERN = /^[0-9]{3}(?=\.json$)/i;
export const TAILWIND_STYLE = /\.tcss$/i;