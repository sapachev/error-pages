import { DEFAULTS } from "./lib/constants";
import { copyAssets, flush, readConfig } from "./lib/fs";
import { compile } from "./lib/compile";
import { buildTailwind } from "./lib/style";

readConfig(DEFAULTS.CONFIG)
  .then(async (config) => {
    await flush(DEFAULTS.DIST);
    await compile(config);
    await buildTailwind(config);
    await copyAssets(`${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`, `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}`);
  })
  .catch((err) => {
    console.error(`
An error happened during compile process. Please, check 'README.md' to get more details about calling this process.

Error Message:
${err.message}

Error Stack:
${err.stack}
    `);
  });
