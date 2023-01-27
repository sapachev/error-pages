import { injectable, inject } from "inversify";

import { Config } from "./interfaces";
import { Messages } from "./Messages";

import { MessagesEnum } from "../messages";
import { MANDATORY_CONFIG_PROPS } from "./constants";
import { sourceStyleFilter } from "./style";
import { ILogger } from "./Logger";
import { DI_TOKENS } from "./tokens";
import { IFileSystemWrapper } from "./FileSystemWrapper";

@injectable()
export class FileSystemHelper {
  constructor(@inject(DI_TOKENS.FS) private fs: IFileSystemWrapper, @inject(DI_TOKENS.LOGGER) private logger: ILogger) {}

  async copyAssets(src: string, dest: string): Promise<void> {
    if (await this.ensure(src)) {
      this.logger.print(Messages.info(MessagesEnum.COPYING_ASSETS));
      await this.fs.cp(src, dest, {
        recursive: true,
        filter: sourceStyleFilter,
      });
    } else {
      this.logger.print(Messages.info(MessagesEnum.NO_ASSETS_TO_COPY));
    }
  }

  async ensure(path: string): Promise<boolean> {
    try {
      await this.fs.access(path);
      return true;
    } catch (_) {
      return false;
    }
  }

  async flush(path: string): Promise<void> {
    this.logger.print(Messages.info(MessagesEnum.FLUSH_DESTINATION, { path }));

    await this.fs.rm(path, { force: true, recursive: true });
    await this.fs.mkdir(path, { recursive: true });
  }

  async readJson<T>(path: string): Promise<T> {
    return await this.fs.readFile(path).then(String).then(JSON.parse);
  }

  async readConfig(path: string): Promise<Config> {
    const config = await this.readJson<Config>(path);

    // Check mandatory config properties
    MANDATORY_CONFIG_PROPS.forEach((prop) => {
      if (config[prop] === undefined) {
        throw new Error(Messages.error(MessagesEnum.NO_CONFIG_PROPERTY, { prop, path }));
      }
    });

    return config;
  }
}
