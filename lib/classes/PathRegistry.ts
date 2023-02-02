import { resolve } from "path";

import { MessagesEnum } from "../../messages";
import { Messages } from "./Messages";

type AnyStringObject = { [key: string]: string };

export class PathRegistry {
  private registry: Map<string, string>;

  constructor(paths: AnyStringObject) {
    this.init(paths);
  }

  private init(paths: AnyStringObject) {
    this.registry = new Map(
      Object.entries(paths).map(([key, value]) => {
        return [key, this.resolveToCwd(value)];
      })
    );
  }

  private resolveToCwd(path: string): string {
    return resolve(process.cwd(), path);
  }

  get(key: string): string {
    if (this.registry.has(key)) {
      return this.registry.get(key);
    }
    throw new Error(Messages.text(MessagesEnum.NO_PATH, { key }));
  }

  join(key: string, path: string): string {
    return `${this.get(key)}/${path}`;
  }

  update(paths: AnyStringObject): void {
    Object.entries(paths).forEach(([key, value]) => this.registry.set(key, this.resolveToCwd(value)));
  }
}
