import { render } from "mustache";
import { injectable } from "tsyringe";

import { AnyVariables } from "./interfaces";

export class Messages {
  static error(msg: string, vars: AnyVariables = {}): string {
    return render(msg, vars);
  }

  static info(msg: string, vars: AnyVariables = {}): string {
    return render(`INFO: ${msg}`, vars);
  }

  static warn(msg: string, vars: AnyVariables = {}): string {
    return render(`WARN: ${msg}`, vars);
  }
}
