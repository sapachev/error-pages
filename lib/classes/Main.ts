import { inject, injectable } from "inversify";

import { IFileSystemHelper } from "./FileSystemHelper";
import { ILogger } from "./Logger";
import { ICompiler } from "./Compiler";
import { Messages } from "./Messages";

import { ConfigProvider } from "../interfaces";
import { DEFAULTS } from "../constants";
import { DI_TOKENS } from "../tokens";
import { MessagesEnum } from "../../messages";
import { IStyler } from "./Styler";

@injectable()
export class Main {
  constructor(
    @inject(DI_TOKENS.CONFIG_PROVIDER) private configProvider: ConfigProvider,
    @inject(DI_TOKENS.COMPILER) private compiler: ICompiler,
    @inject(DI_TOKENS.FS_HELPER) private fsHelper: IFileSystemHelper,
    @inject(DI_TOKENS.LOGGER) private logger: ILogger,
    @inject(DI_TOKENS.STYLER) private styler: IStyler
  ) {}

  async start() {
    const startTime = Date.now();
    const config = await this.configProvider();

    this.logger.print(Messages.info(MessagesEnum.START));

    // Cleanup before new building
    await this.fsHelper.flush(DEFAULTS.DIST);

    // Generate static pages
    await this.compiler.makePages();

    // Generate web servers config snippets
    await this.compiler.makeConfigs();

    // Generate styles with Tailwind
    if (config.tailwind) {
      const input = `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_ENTRY}`;
      const output = `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_ENTRY.replace(".twnd.css", ".css")}`;
      await this.styler.buildTailwind(input, output);
    } else {
      this.logger.print(Messages.warn(MessagesEnum.TAILWIND_DISABLED));
    }

    //  Copy assets to the dist directory
    await this.fsHelper.copyAssets(`${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`, `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}`);

    this.logger.print(Messages.info(MessagesEnum.DONE, { duration: (Date.now() - startTime) / 1000 }));
  }
}
