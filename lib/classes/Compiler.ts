import { injectable, inject } from "inversify";
import { PackageId } from "typescript";

import { IFileSystemHelper } from "./FileSystemHelper";
import { ILogger } from "./Logger";
import { Messages } from "./Messages";
import { Renderer } from "./Renderer";

import { DEFAULTS } from "../constants";
import { Config, ConfigProvider, TemplateVariables } from "../interfaces";
import { DI_TOKENS } from "../tokens";
import { MessagesEnum } from "../../messages";

export const SRC_CODE_PATTERN = /^[0-9]{3}(?=\.json$)/i;

export interface ICompiler {
  initTemplateVariables(): Promise<TemplateVariables>;
  getStatusList(): Promise<Set<number>>;
  makePages(): Promise<void>;
  makeConfigs(): Promise<void>;
}

@injectable()
export class Compiler implements ICompiler {
  private config: Config;
  private statusList: Set<number> = new Set();

  constructor(
    @inject(DI_TOKENS.CONFIG_PROVIDER) private configProvider: ConfigProvider,
    @inject(DI_TOKENS.FS_HELPER) private fsHelper: IFileSystemHelper,
    @inject(DI_TOKENS.LOGGER) private logger: ILogger
  ) {}

  async initTemplateVariables(): Promise<TemplateVariables> {
    const config = await this.getConfig();

    const pkg = await this.fsHelper.readJson<PackageId>(DEFAULTS.PACKAGE);
    return {
      locale: config.locale,
      version: pkg.version,
    };
  }

  async getConfig(): Promise<Config> {
    if (!this.config) {
      this.config = await this.configProvider();
    }
    return this.config;
  }

  async getStatusList(): Promise<Set<number>> {
    const config = await this.getConfig();

    if (this.statusList.size === 0) {
      await this.fsHelper.readDir(`${DEFAULTS.SRC}/${config.locale}/`).then((files) => {
        files.forEach((file) => {
          const match = file.match(SRC_CODE_PATTERN);
          if (match) {
            this.statusList.add(Number(match[0]));
          }
        });
      });
    }
    return this.statusList;
  }

  async makePages(): Promise<void> {
    const config = await this.getConfig();

    this.logger.print(Messages.info(MessagesEnum.COMPILE_PAGES));
    const list = await this.getStatusList();
    if (list.size > 0) {
      const initVars = await this.initTemplateVariables();
      const commonVars = await this.fsHelper.readJson<TemplateVariables>(`${DEFAULTS.SRC}/${config.locale}/common.json`);
      const template = await this.fsHelper.readFile(`${DEFAULTS.THEMES}/${config.theme}/template.html`);

      await Promise.all(
        Array.from(list).map(async (code) => {
          const statusVars = await this.fsHelper.readJson<TemplateVariables>(`${DEFAULTS.SRC}/${config.locale}/${code}.json`);
          const path = `${DEFAULTS.DIST}/${code}.html`;

          this.logger.print(Messages.list(path));

          await this.fsHelper.writeFile(path, Renderer.renderTemplate(template, { ...initVars, ...commonVars, ...statusVars, code }));
        })
      );
    } else {
      throw new Error(Messages.error(MessagesEnum.NO_SOURCE_DATA));
    }
  }

  async makeConfigs(): Promise<void> {
    this.logger.print(Messages.info(MessagesEnum.COMPILE_CONFIGS));
    const list = await this.getStatusList();
    if (list.size > 0) {
      const snippets = await this.fsHelper.readDir(`${DEFAULTS.SNIPPETS}/`);

      await Promise.all(
        snippets.map(async (snippet) => {
          const path = `${DEFAULTS.DIST}/${snippet}`;

          this.logger.print(Messages.list(path));

          const template = await this.fsHelper.readFile(`${DEFAULTS.SNIPPETS}/${snippet}`);
          await this.fsHelper.writeFile(path, Renderer.renderTemplate(template, { codes: Array.from(list) }));
        })
      );
    } else {
      throw new Error(Messages.error(MessagesEnum.NO_SOURCE_DATA));
    }
  }
}
