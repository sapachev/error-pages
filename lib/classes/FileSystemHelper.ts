import { injectable, inject } from "inversify";

import { Config } from "../models";
import { Messages } from "./Messages";
import { Styler } from "./Styler";
import { ILogger } from "./Logger";
import { IFileSystemWrapper } from "./FileSystemWrapper";

import { DI_TOKENS } from "../tokens";
import { MANDATORY_CONFIG_PROPS } from "../constants";
import { MessagesEnum } from "../../messages";

export interface IFileSystemHelper {
  copyAssets(src: string, dest: string): Promise<void>;
  ensure(path: string): Promise<boolean>;
  flush(path: string): Promise<void>;
  readDir(path: string): Promise<string[]>;
  readFile(path: string): Promise<string>;
  readJson<T>(path: string): Promise<T>;
  readConfig(path: string): Promise<Config>;
  writeFile(path: string, data: string): Promise<void>;
}

@injectable()
export class FileSystemHelper implements IFileSystemHelper {
  constructor(@inject(DI_TOKENS.FS) private fs: IFileSystemWrapper, @inject(DI_TOKENS.LOGGER) private logger: ILogger) {}

  async copyAssets(src: string, dest: string): Promise<void> {
    if (await this.ensure(src)) {
      this.logger.print(Messages.info(MessagesEnum.COPYING_ASSETS, { dest }));
      await this.fs.cp(src, dest, {
        recursive: true,
        // TODO: add Logger.print() to filter function
        filter: Styler.sourceStyleFilter,
      });
      // TODO: IMPROVEMENT: return list of copied files to add into web server configs as fixed locations
    } else {
      this.logger.print(Messages.warn(MessagesEnum.NO_ASSETS_TO_COPY));
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

  async readDir(path: string): Promise<string[]> {
    if (await this.ensure(path)) {
      return await this.fs.readDir(path);
    } else {
      throw new Error(Messages.text(MessagesEnum.NO_DIRECTORY, { path }));
    }
  }

  async readFile(path: string): Promise<string> {
    if (await this.ensure(path)) {
      return await this.fs.readFile(path).then(String);
    } else {
      throw new Error(Messages.text(MessagesEnum.NO_FILE, { path }));
    }
  }

  async readJson<T>(path: string): Promise<T> {
    if (await this.ensure(path)) {
      return await this.readFile(path).then(JSON.parse);
    }
    return {} as T;
  }

  async readConfig(path: string): Promise<Config> {
    const config = await this.readJson<Config>(path);

    // Check mandatory config properties
    MANDATORY_CONFIG_PROPS.forEach((prop) => {
      if (config[prop] === undefined) {
        throw new Error(Messages.text(MessagesEnum.NO_CONFIG_PROPERTY, { prop, path }));
      }
    });

    return config;
  }

  async writeFile(path: string, data: string, opts = { flag: "w+" }): Promise<void> {
    return await this.fs.writeFile(path, data, opts);
  }
}

@injectable()
export class MockFileSystemHelper implements IFileSystemHelper {
  async copyAssets() {
    return null;
  }

  async ensure() {
    return true;
  }

  async flush() {
    return null;
  }

  async readDir() {
    return [];
  }

  async readFile() {
    return "";
  }

  async readJson<T>() {
    return {} as T;
  }

  async readConfig() {
    return {} as Config;
  }

  async writeFile() {
    return null;
  }
}
