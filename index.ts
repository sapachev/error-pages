import "reflect-metadata";

import * as fs from "fs/promises";
import { container } from "tsyringe";

import { DEFAULTS } from "./lib/constants";
import { compile } from "./lib/compile";
import { buildTailwind } from "./lib/style";
import { FileSystemHelper } from "./lib/FileSystemHelper";

container.register("fs/promise", { useValue: fs });

container
  .resolve(FileSystemHelper)
  .readConfig(DEFAULTS.CONFIG)
  .then(async (config) => {
    const fsHelper = container.resolve(FileSystemHelper);
    await fsHelper.flush(DEFAULTS.DIST);
    await compile(config);
    await buildTailwind(config);
    await fsHelper.copyAssets(`${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`, `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}`);
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
