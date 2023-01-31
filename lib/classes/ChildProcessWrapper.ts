import { exec } from "child_process";
import { injectable } from "inversify";
import { promisify } from "util";

export interface IChildProcessWrapper {
  exec(cmd: string): Promise<{ stdout: string; stderr: string }>;
}

@injectable()
export class ChildProcessWrapper implements IChildProcessWrapper {
  exec(cmd: string) {
    return promisify(exec)(cmd);
  }
}

@injectable()
export class MockChildProcessWrapper implements IChildProcessWrapper {
  async exec() {
    return null;
  }
}
