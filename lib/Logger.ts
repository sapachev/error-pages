import { injectable } from "tsyringe";

@injectable()
export class Logger {
  print(message: string) {
    console.log(message);
  }
}
