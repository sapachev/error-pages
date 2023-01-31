export type Config = {
  locale: string;
  tailwind: boolean;
  theme: string;
};

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

export interface AnyVariables {
  [key: string]: string | number;
}

export interface TemplateVariables extends AnyVariables {
  locale: string;
  version: string;
}

export interface SnippetVariables {
  codes: number[];
}

export type ConfigProvider = () => Promise<Config>;
