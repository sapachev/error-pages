import { promisify } from 'util';
import { exec } from 'child_process';
import { access, cp, readFile, readdir, rm, mkdir, writeFile } from 'fs/promises';
import { render } from 'mustache';

import { DEFAULTS, SRC_CODE_PATTERN, TAILWIND_STYLE } from './lib/constants';
import { Config, SatusCode, SnippetVariables, TemplateVariables } from "./lib/interfaces";

async function compile(config: Config) {
  try {
    let vars: TemplateVariables = {
      locale: config.locale,
    };

    const template = await readFile(`${DEFAULTS.THEMES}/${config.theme}/template.html`).then(String);

    const codesVars = new Map<SatusCode, TemplateVariables>();
    await readdir(`${DEFAULTS.SRC}/${config.locale}/`)
      .then(files => {
        return Promise.all(
          files.map(async (file) => {
            const srcVars: TemplateVariables = await readJson(`${DEFAULTS.SRC}/${config.locale}/${file}`);
            const match = file.match(SRC_CODE_PATTERN);
            if (match) {
              codesVars.set(Number(match[0]), srcVars);
            }
            else {
              vars = {...vars, ...srcVars};
            }
          })
        )
      })

    if (codesVars.size > 0) {
      await Promise.all(
        Array.from(codesVars).map(
          ([code, codeVars]) => renderPage(template, {...vars, ...codeVars, code})
        )
      ).then(() => {
        console.log(`INFO: ${codesVars.size} pages were successfully created`);
      });

      await readdir(`${DEFAULTS.SNIPPETS}/`)
      .then(files => {
        return Promise.all(
          files.map(async (file) => {
            const snippet = await readFile(`${DEFAULTS.SNIPPETS}/${file}`).then(String);
            return renderSnippet(file, snippet, { locale: config.locale, codes: Array.from(codesVars.keys()) })
          })
        )
      })
    }
    else {
      throw new Error('No source data to render error pages');
    }
  } catch (err) {
    throw err;
  }
}

async function execTailwind(config: Config) {
  try {
    if (config.tailwind) {
      const input = `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_ENTRY}`;
      const output = `${DEFAULTS.DIST}/${config.locale}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_ENTRY.replace('.tcss', '.css')}`;
      const cmd = `INPUT="${input}" OUTPUT="${output}" npm run build:tailwind`;

      console.log(`INFO: build Tailwind CSS styles`);
      console.log(`INFO: run '${cmd}'`);

      await promisify(exec)(cmd).then(() => {
        console.log(`INFO: Tailwind CSS styles were built`);
      });
    }
    else {
      console.log(`WARN: Tailwind CSS was disabled in config`);
    }
  } catch (err) {
    throw err;
  }
}

async function readJson(path: string) {
  try {
    return await readFile(path).then(String).then(JSON.parse);
  } catch (err) {
    throw err;
  }
}

async function renderPage(template: string, vars: TemplateVariables) {
  try {
    if (!vars.code) {
      throw new Error('No code variable to render page');
    } else  if (!vars.locale) {
      throw new Error('No locale variable to render page');
    }

    const path = `${DEFAULTS.DIST}/${vars.locale}/${vars.code}.html`;

    console.log(`INFO: render '${path}' page`);
    await writeFile(path, render(template, vars), { flag: 'w+' });
  } catch (err) {
    throw err;
  }
}

async function renderSnippet(name: string, template: string, vars: SnippetVariables) {
  try {
    if (!vars.codes) {
      throw new Error('No codes list to render config snippet');
    } else  if (!vars.locale) {
      throw new Error('No locale variable to render config snippet');
    }

    const path = `${DEFAULTS.DIST}/${vars.locale}/${name}`;

    console.log(`INFO: render '${path}' config snippet`);
    await writeFile(path, render(template, vars), { flag: 'w+' });
    console.log(`INFO: config snippet '${name}' was successfully created`);
  } catch (err) {
    throw err;
  }
}

async function readConfig(): Promise<Config> {
 try {
    const config = await readJson(DEFAULTS.CONFIG);

    if (!config.theme) {
      throw new Error(`Please set theme in your configuration: ${DEFAULTS.CONFIG}`);
    } else if (!config.locale) {
      throw new Error(`Please set locale in your configuration: ${DEFAULTS.CONFIG}`);
    }

    return config;
  } catch (err) {
    throw err;
  }
}

async function prepare(config: Config) {
  try {
    console.log(`INFO: prepare build directory '${DEFAULTS.DIST}'`);

    await rm(DEFAULTS.DIST, { force: true, recursive: true });
    await mkdir(`${DEFAULTS.DIST}/${config.locale}/`, { recursive: true });
  } catch (err) {
    throw err;
  }
}

async function copyAssets(config: Config) {
  try {
    console.log(`INFO: copying assets to build directory '${DEFAULTS.DIST}'`);

    const path = `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`;

    let exists = false;
    try {
      await access(path);
      exists = true;
    } catch (_) {}

    if (exists) {
      await cp(
          path,
          `${DEFAULTS.DIST}/${config.locale}/${DEFAULTS.ASSETS}`,
          {
            recursive: true,
            // Skip Tailwind styles to copy
            filter: (src) => !TAILWIND_STYLE.test(src)
          }
        );
    }
    else {
      console.log(`INFO: no assets in '${config.theme}' theme directory`);
    }
  } catch (err) {
    throw err;
  }
}

readConfig()
  .then(async (config) => {
      await prepare(config);
      await compile(config);
      await execTailwind(config);
      await copyAssets(config);
  })
  .catch(err => {
    console.error(`
An error happened during compile process. Please, check 'README.md' to get more details about calling this process.

Error Message:
${err.message}

Error Stack:
${err.stack}
    `);
  });