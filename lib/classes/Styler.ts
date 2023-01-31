import { inject, injectable } from "inversify";

import { ILogger } from "./Logger";
import { Messages } from "./Messages";

import { DI_TOKENS } from "../tokens";
import { MessagesEnum } from "../../messages";
import { IChildProcessWrapper } from "./ChildProcessWrapper";

export const TAILWIND_STYLE = /\.twnd.css$/i;

export interface IStyler {
  buildTailwind(input: string, output: string): Promise<void>;
}

@injectable()
export class Styler implements IStyler {
  constructor(
    @inject(DI_TOKENS.CHILD_PROCESS) private childProcess: IChildProcessWrapper,
    @inject(DI_TOKENS.LOGGER) private logger: ILogger
  ) {}

  async buildTailwind(input: string, output: string) {
    const cmd = Styler.getTailwindCommand(input, output);

    this.logger.print(Messages.info(MessagesEnum.TAILWIND_START));
    this.logger.print(Messages.info(MessagesEnum.TAILWIND_CMD, { cmd }));

    await this.childProcess.exec(cmd);
    this.logger.print(Messages.info(MessagesEnum.TAILWIND_DONE));
  }

  static getTailwindCommand(input: string, output: string) {
    return `INPUT="${input}" OUTPUT="${output}" npm run build:tailwind`;
  }

  static sourceStyleFilter(path: string): boolean {
    // Tailwind styles filter
    return !TAILWIND_STYLE.test(path);
  }
}
