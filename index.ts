import "reflect-metadata";

import { Container } from "inversify";

// import { DEFAULTS } from "./lib/constants";
// import { Compiler } from "./lib/Compiler";
// import { buildTailwind } from "./lib/style";
import { FileSystemHelper, IFileSystemHelper } from "./lib/FileSystemHelper";
import { ILogger, Logger } from "./lib/Logger";
// import { Messages } from "./lib/Messages";
import { DI_TOKENS } from "./lib/tokens";
import { IFileSystemWrapper, NodeFS } from "./lib/FileSystemWrapper";
import { Main } from "./lib/Main";
import { IRenderer, Renderer } from "./lib/Renderer";

// Register DI
const runContainer = new Container({ defaultScope: "Singleton" });
runContainer.bind<IFileSystemHelper>(DI_TOKENS.FS_HELPER).to(FileSystemHelper);
runContainer.bind<IFileSystemWrapper>(DI_TOKENS.FS).to(NodeFS);
runContainer.bind<ILogger>(DI_TOKENS.LOGGER).to(Logger);
runContainer.bind<IRenderer>(DI_TOKENS.RENDERER).to(Renderer);

runContainer.resolve(Main).start(runContainer);

/* const fsHelper = runContainer.resolve(FileSystemHelper);
fsHelper
  .readConfig(DEFAULTS.CONFIG)
  .then(async (config) => {
    await fsHelper.flush(DEFAULTS.DIST);
    await compile(config, fsHelper);
    await buildTailwind(config);
    await fsHelper.copyAssets(`${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`, `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}`);

    const logger = runContainer.get<Logger>(DI_TOKENS.LOGGER);
    logger.print(Messages.info("Done"));
  })
  .catch((err) => {
    console.error(`
An error happened during compile process. Please, check 'README.md' to get more details about calling this process.

Error Message:
${err.message}

Error Stack:
${err.stack}
    `);
  }); */
