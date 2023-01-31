import "reflect-metadata";

import { Container } from "inversify";

import { Compiler, ICompiler } from "./lib/classes/Compiler";
import { ChildProcessWrapper, IChildProcessWrapper } from "./lib/classes/ChildProcessWrapper";
import { FileSystemHelper, IFileSystemHelper } from "./lib/classes/FileSystemHelper";
import { IFileSystemWrapper, NodeFS } from "./lib/classes/FileSystemWrapper";
import { ILogger, Logger } from "./lib/classes/Logger";
import { Main } from "./lib/classes/Main";
import { IStyler, Styler } from "./lib/classes/Styler";

import { DI_TOKENS } from "./lib/tokens";
import { Config, ConfigProvider } from "./lib/interfaces";
import { DEFAULTS } from "./lib/constants";

// Register DI
const runContainer = new Container({ defaultScope: "Singleton" });
runContainer.bind<ICompiler>(DI_TOKENS.COMPILER).to(Compiler);
runContainer.bind<IChildProcessWrapper>(DI_TOKENS.CHILD_PROCESS).to(ChildProcessWrapper);
runContainer.bind<IFileSystemHelper>(DI_TOKENS.FS_HELPER).to(FileSystemHelper);
runContainer.bind<IFileSystemWrapper>(DI_TOKENS.FS).to(NodeFS);
runContainer.bind<ILogger>(DI_TOKENS.LOGGER).to(Logger);
runContainer.bind<IStyler>(DI_TOKENS.STYLER).to(Styler);

runContainer.bind<ConfigProvider>(DI_TOKENS.CONFIG_PROVIDER).toProvider<Config>((ctx) => {
  return () => {
    const fsHelper = ctx.container.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);
    return fsHelper.readConfig(DEFAULTS.CONFIG);
  };
});

runContainer.resolve(Main).start();

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
