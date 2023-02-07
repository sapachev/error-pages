import "reflect-metadata";

import { Container } from "inversify";

import { Compiler, ICompiler } from "./lib/classes/Compiler";
import { ChildProcessWrapper, IChildProcessWrapper } from "./lib/classes/ChildProcessWrapper";
import { FileSystemHelper, IFileSystemHelper } from "./lib/classes/FileSystemHelper";
import { IFileSystemWrapper, NodeFS } from "./lib/classes/FileSystemWrapper";
import { ILogger, Logger } from "./lib/classes/Logger";
import { Main } from "./lib/classes/Main";
import { IStyler, Styler } from "./lib/classes/Styler";

import { Config } from "./lib/interfaces";
import { Messages } from "./lib/classes/Messages";
import { MessagesEnum } from "./messages";
import { PathRegistry } from "./lib/classes/PathRegistry";

import { DEFAULTS } from "./lib/constants";
import { DI_TOKENS } from "./lib/tokens";

// Resigstry of resolved paths to usage during the process
const pr = new PathRegistry({
  assetsDist: `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}`,
  config: DEFAULTS.CONFIG,
  dist: DEFAULTS.DIST,
  package: DEFAULTS.PACKAGE,
  snippets: DEFAULTS.SNIPPETS,
  twndDist: `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_OUT}`,
});

// Register DI
const runContainer = new Container({ defaultScope: "Singleton" });
runContainer.bind<ICompiler>(DI_TOKENS.COMPILER).to(Compiler);
runContainer.bind<IChildProcessWrapper>(DI_TOKENS.CHILD_PROCESS).to(ChildProcessWrapper);
runContainer.bind<IFileSystemHelper>(DI_TOKENS.FS_HELPER).to(FileSystemHelper);
runContainer.bind<IFileSystemWrapper>(DI_TOKENS.FS).to(NodeFS);
runContainer.bind<ILogger>(DI_TOKENS.LOGGER).to(Logger);
runContainer.bind<IStyler>(DI_TOKENS.STYLER).to(Styler);
runContainer.bind<PathRegistry>(DI_TOKENS.PATH).toConstantValue(pr);

runContainer
  .resolve(FileSystemHelper)
  .readConfig(pr.get("config"))
  .then((config) => {
    runContainer.bind<Config>(DI_TOKENS.CONFIG).toConstantValue(config);

    // Registry update with new paths, which depends on current config
    pr.update({
      assetsSrc: `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`,
      theme: `${DEFAULTS.THEMES}/${config.theme}`,
      src: `${DEFAULTS.SRC}/${config.locale}`,
      twndSrc: `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_IN}`,
    });

    return runContainer.resolve(Main).start();
  })
  .catch((err) => {
    runContainer.get<ILogger>(DI_TOKENS.LOGGER).print(Messages.error(MessagesEnum.OVERALL, err));
    process.exit(1);
  });
