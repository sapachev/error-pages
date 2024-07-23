export type Config = {
  locale: string;
  tailwind: boolean;
  theme: string;
};

export type Defaults = {
  ASSETS: string;
  CONFIG: string;
  DIST: string;
  PACKAGE: string;
  SNIPPETS: string;
  SRC: string;
  TAILWIND_IN: string;
  TAILWIND_OUT: string;
  THEMES: string;
};

export type AnyVariables = {
  [key: string]: string | number;
};

export type TemplateVariables = {
  locale: string;
  version: string;
} & AnyVariables;

export type SnippetVariables = {
  codes: number[];
};
