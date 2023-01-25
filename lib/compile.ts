import { readFile, readdir } from "fs/promises";

import { DEFAULTS, SRC_CODE_PATTERN } from "./constants";
import { Config, SatusCode, TemplateVariables } from "./interfaces";
import { renderPage, renderSnippet } from "./render";
import { readJson } from "./fs";

export async function compile(config: Config) {
  const pkg = await readJson(DEFAULTS.PACKAGE);
  let vars: TemplateVariables = {
    locale: config.locale,
    version: pkg.version,
  };

  const template = await readFile(`${DEFAULTS.THEMES}/${config.theme}/template.html`).then(String);

  const codesVars = new Map<SatusCode, TemplateVariables>();
  await readdir(`${DEFAULTS.SRC}/${config.locale}/`).then((files) => {
    return Promise.all(
      files.map(async (file) => {
        const srcVars: TemplateVariables = await readJson(`${DEFAULTS.SRC}/${config.locale}/${file}`);
        const match = file.match(SRC_CODE_PATTERN);
        if (match) {
          codesVars.set(Number(match[0]), srcVars);
        } else {
          vars = { ...vars, ...srcVars };
        }
      })
    );
  });

  if (codesVars.size > 0) {
    await Promise.all(Array.from(codesVars).map(([code, codeVars]) => renderPage(template, { ...vars, ...codeVars, code }))).then(() => {
      console.log(`INFO: ${codesVars.size} pages were successfully created`);
    });

    await readdir(`${DEFAULTS.SNIPPETS}/`).then((files) => {
      return Promise.all(
        files.map(async (file) => {
          const snippet = await readFile(`${DEFAULTS.SNIPPETS}/${file}`).then(String);
          return renderSnippet(file, snippet, { codes: Array.from(codesVars.keys()) });
        })
      );
    });
  } else {
    throw new Error("No source data to render error pages");
  }
}
