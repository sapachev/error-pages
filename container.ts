import { Container } from "inversify";

import { Compiler, ICompiler } from "./lib/classes/Compiler";
import { ChildProcessWrapper, IChildProcessWrapper } from "./lib/classes/ChildProcessWrapper";
import { FileSystemHelper, IFileSystemHelper } from "./lib/classes/FileSystemHelper";
import { IFileSystemWrapper, NodeFS } from "./lib/classes/FileSystemWrapper";
import { ILogger, Logger } from "./lib/classes/Logger";
import { PathRegistry } from "./lib/classes/PathRegistry";
import { IStyler, Styler } from "./lib/classes/Styler";

import { pr } from "./path-registry";

import { DI_TOKENS } from "./lib/tokens";

// Register DI
export function initContainer(): Container {
  const container = new Container({ defaultScope: "Singleton" });
  container.bind<ICompiler>(DI_TOKENS.COMPILER).to(Compiler);
  container.bind<IChildProcessWrapper>(DI_TOKENS.CHILD_PROCESS).to(ChildProcessWrapper);
  container.bind<IFileSystemHelper>(DI_TOKENS.FS_HELPER).to(FileSystemHelper);
  container.bind<IFileSystemWrapper>(DI_TOKENS.FS).to(NodeFS);
  container.bind<ILogger>(DI_TOKENS.LOGGER).to(Logger);
  container.bind<IStyler>(DI_TOKENS.STYLER).to(Styler);
  container.bind<PathRegistry>(DI_TOKENS.PATH).toConstantValue(pr);

  return container;
}
