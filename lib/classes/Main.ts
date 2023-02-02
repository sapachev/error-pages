import { inject, injectable } from "inversify";

import { IFileSystemHelper } from "./FileSystemHelper";
import { ILogger } from "./Logger";
import { ICompiler } from "./Compiler";
import { IStyler } from "./Styler";
import { Messages } from "./Messages";
import { PathRegistry } from "./PathRegistry";

import { Config } from "../interfaces";
import { DI_TOKENS } from "../tokens";
import { MessagesEnum } from "../../messages";

@injectable()
export class Main {
  constructor(
    @inject(DI_TOKENS.COMPILER) private compiler: ICompiler,
    @inject(DI_TOKENS.FS_HELPER) private fsHelper: IFileSystemHelper,
    @inject(DI_TOKENS.LOGGER) private logger: ILogger,
    @inject(DI_TOKENS.STYLER) private styler: IStyler,
    @inject(DI_TOKENS.CONFIG) private config: Config,
    @inject(DI_TOKENS.PATH) private pr: PathRegistry
  ) {}

  async start() {
    const startTime = Date.now();

    this.logger.print(Messages.info(MessagesEnum.START));

    // Cleanup before new building
    await this.fsHelper.flush(this.pr.get("dist"));

    // Generate static pages
    await this.compiler.makePages();

    // Generate web servers config snippets
    await this.compiler.makeConfigs();

    // Generate styles with Tailwind
    if (this.config.tailwind) {
      await this.styler.buildTailwind(this.pr.get("twndSrc"), this.pr.get("twndDist"));
    } else {
      this.logger.print(Messages.warn(MessagesEnum.TAILWIND_DISABLED));
    }

    //  Copy assets to the dist directory
    await this.fsHelper.copyAssets(this.pr.get("assetsSrc"), this.pr.get("assetsDist"));

    this.logger.print(Messages.info(MessagesEnum.DONE, { duration: (Date.now() - startTime) / 1000 }));
  }
}
