import { Container, inject, injectable } from "inversify";

import { IFileSystemHelper } from "./FileSystemHelper";
import { ILogger } from "./Logger";
import { Messages } from "./Messages";

import { Config } from "./interfaces";
import { DEFAULTS } from "./constants";
import { DI_TOKENS } from "./tokens";
import { MessagesEnum } from "../messages";
import { Compiler } from "./Compiler";

@injectable()
export class Main {
  constructor(@inject(DI_TOKENS.FS_HELPER) private fsHelper: IFileSystemHelper, @inject(DI_TOKENS.LOGGER) private logger: ILogger) {}

  async start(container: Container) {
    const startTime = Date.now();

    this.logger.print(Messages.info(MessagesEnum.START));

    // Read main config and bind it to the DI container
    const config = await this.fsHelper.readConfig(DEFAULTS.CONFIG);
    container.bind<Config>(DI_TOKENS.CONFIG).toConstantValue(config);

    // Get Compiler instance with injected config
    const compiler = container.resolve(Compiler);

    // Cleanup before new building
    await this.fsHelper.flush(DEFAULTS.DIST);

    // Generate static pages
    await compiler.makePages();

    // Generate web servers config snippets
    await compiler.makeConfigs();

    //  Copy assets to the dist directory
    await this.fsHelper.copyAssets(`${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`, `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}`);

    this.logger.print(Messages.info(MessagesEnum.DONE, { duration: (Date.now() - startTime) / 1000 }));
  }
}
