export interface Defaults {
  ASSETS: string;
  CONFIG: string;
  DIST: string;
  PACKAGE: string;
  SNIPPETS: string;
  SRC: string;
  TAILWIND_ENTRY: string;
  THEMES: string;
}

export interface Config {
  tailwind: boolean;
  theme: string;
  locale: string;
}

export type SatusCode = number;

export interface TemplateVariables {
  locale: string;
  version: string;
  [key: string]: string | number;
}

export interface SnippetVariables {
  codes: SatusCode[];
  locale: string;
}
