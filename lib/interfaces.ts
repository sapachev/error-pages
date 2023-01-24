export interface Defaults {
  ASSETS: string;
  CONFIG: string;
  SRC: string;
  DIST: string;
  SNIPPETS: string;
  THEMES: string;
  TAILWIND_ENTRY: string;
}

export interface Config {
  tailwind: boolean;
  theme: string;
  locale: string;
}

export type SatusCode = number;

export interface TemplateVariables {
  locale: string;
  [key: string]: string | number;
}

export interface SnippetVariables {
  codes: SatusCode[];
  locale: string;
}
