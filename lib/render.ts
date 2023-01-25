import { writeFile } from "fs/promises";
import { render } from "mustache";

import { DEFAULTS } from "./constants";
import { SnippetVariables, TemplateVariables } from "./interfaces";

export async function renderPage(template: string, vars: TemplateVariables) {
  if (!vars.code) {
    throw new Error("No code variable to render page");
  } else if (!vars.locale) {
    throw new Error("No locale variable to render page");
  }

  const path = `${DEFAULTS.DIST}/${vars.code}.html`;

  console.log(`INFO: render '${path}' page`);
  await writeFile(path, render(template, vars), { flag: "w+" });
}

export async function renderSnippet(name: string, template: string, vars: SnippetVariables) {
  if (!vars.codes) {
    throw new Error("No codes list to render config snippet");
  }

  const path = `${DEFAULTS.DIST}/${name}`;

  console.log(`INFO: render '${path}' config snippet`);
  await writeFile(path, render(template, vars), { flag: "w+" });
  console.log(`INFO: config snippet '${name}' was successfully created`);
}
