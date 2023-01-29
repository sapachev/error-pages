import { injectable } from "inversify";

export interface ILogger {
  print(message: string): void;
}

@injectable()
export class Logger implements ILogger {
  print(message: string) {
    console.log(message);
  }
}

@injectable()
export class MockLogger implements ILogger {
  print(m: string) {
    return m;
  }
}
