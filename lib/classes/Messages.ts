import { render } from "mustache";

import { AnyVariables } from "../interfaces";

export class Messages {
  static error(msg: string, vars: AnyVariables = {}): string {
    return render(msg, vars);
  }

  static info(msg: string, vars: AnyVariables = {}): string {
    return render(`INFO: ${msg}`, vars);
  }

  static list(msg: string, vars: AnyVariables = {}): string {
    return render(` • ${msg}`, vars);
  }

  static skip(msg: string, vars: AnyVariables = {}): string {
    return render(`  SKIP: ${msg}`, vars);
  }

  static warn(msg: string, vars: AnyVariables = {}): string {
    return render(`WARN: ${msg}`, vars);
  }
}
