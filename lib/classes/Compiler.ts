import { injectable, inject } from "inversify";
import { PackageId } from "typescript";

import { IFileSystemHelper } from "./FileSystemHelper";
import { ILogger } from "./Logger";
import { Messages } from "./Messages";
import { Renderer } from "./Renderer";

import { Config, SnippetVariables, TemplateVariables } from "../interfaces";
import { DI_TOKENS } from "../tokens";
import { MessagesEnum } from "../../messages";
import { PathRegistry } from "./PathRegistry";

export const SRC_CODE_PATTERN = /^[0-9]{3}(?=\.json$)/i;

export interface ICompiler {
  initTemplateVariables(): Promise<TemplateVariables>;
  getStatusList(): Promise<Set<number>>;
  makePages(): Promise<void>;
  makeConfigs(): Promise<void>;
}

@injectable()
export class Compiler implements ICompiler {
  private statusList: Set<number> = new Set();

  constructor(
    @inject(DI_TOKENS.CONFIG) private config: Config,
    @inject(DI_TOKENS.FS_HELPER) private fsHelper: IFileSystemHelper,
    @inject(DI_TOKENS.LOGGER) private logger: ILogger,
    @inject(DI_TOKENS.PATH) private pr: PathRegistry
  ) {}

  async initTemplateVariables(): Promise<TemplateVariables> {
    const pkg = await this.fsHelper.readJson<PackageId>(this.pr.get("package"));

    if (!this.config.locale || !pkg.version) {
      throw new Error(Messages.text(MessagesEnum.NO_DEFAULT_VARS));
    }

    return {
      locale: this.config.locale,
      version: pkg.version,
    };
  }

  async getStatusList(): Promise<Set<number>> {
    if (this.statusList.size === 0) {
      await this.fsHelper.readDir(this.pr.get("src")).then((files) => {
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
    this.logger.print(Messages.info(MessagesEnum.COMPILE_PAGES));
    const list = await this.getStatusList();
    if (list.size > 0) {
      const initVars = await this.initTemplateVariables();
      const commonVars = await this.fsHelper.readJson<TemplateVariables>(this.pr.join("src", "common.json"));

      const template = await this.fsHelper.readFile(this.pr.join("theme", "template.html"));
      if (!template) {
        throw new Error(Messages.text(MessagesEnum.NO_TEMPLATE_CONTENT));
      }

      await Promise.all(
        Array.from(list).map(async (code) => {
          const statusVars = await this.fsHelper.readJson<TemplateVariables>(this.pr.join("src", `${code}.json`));
          const path = this.pr.join("dist", `${code}.html`);

          this.logger.print(Messages.list(path));

          await this.fsHelper.writeFile(path, Renderer.renderTemplate(template, { ...initVars, ...commonVars, ...statusVars, code }));
        })
      );
    } else {
      throw new Error(Messages.text(MessagesEnum.NO_SOURCE_DATA));
    }
  }

  async makeConfigs(): Promise<void> {
    this.logger.print(Messages.info(MessagesEnum.COMPILE_CONFIGS));
    const list = await this.getStatusList();
    if (list.size > 0) {
      const snippets = await this.fsHelper.readDir(this.pr.get("snippets"));

      await Promise.all(
        snippets.map(async (snippet) => {
          const template = await this.fsHelper.readFile(this.pr.join("snippets", snippet));
          if (!template) {
            throw new Error(Messages.text(MessagesEnum.NO_TEMPLATE_CONTENT));
          }

          const path = this.pr.join("dist", snippet);

          this.logger.print(Messages.list(path));

          await this.fsHelper.writeFile(path, Renderer.renderSnippet(template, { codes: Array.from(list) } as SnippetVariables));
        })
      );
    } else {
      throw new Error(Messages.text(MessagesEnum.NO_SOURCE_DATA));
    }
  }
}
