import { resolve } from "path";

import { MessagesEnum } from "../../messages";
import { Messages } from "./Messages";

type AnyStringObject = { [key: string]: string };

export class PathDispatcher {
  private container: Map<string, string>;

  constructor(paths: AnyStringObject) {
    this.init(paths);
  }

  private init(paths: AnyStringObject) {
    this.container = new Map(
      Object.entries(paths).map(([key, value]) => {
        return [key, resolve(process.cwd(), value)];
      })
    );
  }

  get(prop: string): string {
    if (this.container.has(prop)) {
      return this.container.get(prop);
    }
    throw new Error(Messages.text(MessagesEnum.NO_PATH, { prop }));
  }

  join(prop: string, path: string): string {
    return `${this.get(prop)}/${path}`;
  }
}
