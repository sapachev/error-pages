import { inject, injectable } from "inversify";

import { IFileSystemHelper } from "./FileSystemHelper";
import { ILogger } from "./Logger";
import { ICompiler } from "./Compiler";
import { Messages } from "./Messages";

import { ConfigProvider } from "../interfaces";
import { DEFAULTS } from "../constants";
import { DI_TOKENS } from "../tokens";
import { MessagesEnum } from "../../messages";

@injectable()
export class Main {
  constructor(
    @inject(DI_TOKENS.CONFIG_PROVIDER) private configProvider: ConfigProvider,
    @inject(DI_TOKENS.COMPILER) private compiler: ICompiler,
    @inject(DI_TOKENS.FS_HELPER) private fsHelper: IFileSystemHelper,
    @inject(DI_TOKENS.LOGGER) private logger: ILogger
  ) {}

  async start() {
    const startTime = Date.now();

    this.logger.print(Messages.info(MessagesEnum.START));

    // Cleanup before new building
    await this.fsHelper.flush(DEFAULTS.DIST);

    // Generate static pages
    await this.compiler.makePages();

    // Generate web servers config snippets
    await this.compiler.makeConfigs();

    const config = await this.configProvider();

    //  Copy assets to the dist directory
    await this.fsHelper.copyAssets(`${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`, `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}`);

    this.logger.print(Messages.info(MessagesEnum.DONE, { duration: (Date.now() - startTime) / 1000 }));
  }
}
