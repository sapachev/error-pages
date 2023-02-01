import { inject, injectable } from "inversify";

import { IFileSystemHelper } from "./FileSystemHelper";
import { ILogger } from "./Logger";
import { ICompiler } from "./Compiler";
import { IStyler } from "./Styler";
import { Messages } from "./Messages";
import { PathDispatcher } from "./PathContainer";

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
    @inject(DI_TOKENS.LOGGER) private logger: ILogger,
    @inject(DI_TOKENS.STYLER) private styler: IStyler
  ) {}

  async start() {
    const startTime = Date.now();

    const config = await this.configProvider();

    // Init container to store all paths
    const pd = new PathDispatcher({
      assetsSrc: `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`,
      assetsDist: `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}`,
      dist: DEFAULTS.DIST,
      package: DEFAULTS.PACKAGE,
      theme: `${DEFAULTS.THEMES}/${config.theme}`,
      snippets: DEFAULTS.SNIPPETS,
      src: `${DEFAULTS.SRC}/${config.locale}`,
      twndSrc: `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_ENTRY}`,
      twndDist: `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_ENTRY.replace(".twnd.css", ".css")}`,
    });

    this.logger.print(Messages.info(MessagesEnum.START));

    // Cleanup before new building
    await this.fsHelper.flush(pd.get("dist"));

    // Generate static pages
    await this.compiler.makePages(pd);

    // Generate web servers config snippets
    await this.compiler.makeConfigs(pd);

    // Generate styles with Tailwind
    if (config.tailwind) {
      await this.styler.buildTailwind(pd.get("twndSrc"), pd.get("twndDist"));
    } else {
      this.logger.print(Messages.warn(MessagesEnum.TAILWIND_DISABLED));
    }

    //  Copy assets to the dist directory
    await this.fsHelper.copyAssets(pd.get("assetsSrc"), pd.get("assetsDist"));

    this.logger.print(Messages.info(MessagesEnum.DONE, { duration: (Date.now() - startTime) / 1000 }));
  }
}
