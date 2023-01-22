export interface Defaults {
  CONFIG: string,
  SRC: string,
  DIST: string,
  THEMES: string,
  TAILWIND_ENTRY: string,
}

export interface Config {
  tailwind: boolean,
  theme: string,
  locale: string,
}

export type SatusCode = number;

export interface TemplateVariables {
  locale: string;
  [key: string]: string|number;
}