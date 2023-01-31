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
import { Messages } from "./lib/classes/Messages";
import { MessagesEnum } from "./messages";

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

runContainer
  .resolve(Main)
  .start()
  .catch((err) => {
    runContainer.get<ILogger>(DI_TOKENS.LOGGER).print(Messages.error(MessagesEnum.OVERALL, err));
  });
