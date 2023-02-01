import { render } from "mustache";

import { AnyVariables } from "../interfaces";
import { CONSOLE_COLORS } from "../constants";

export class Messages {
  static error(msg: string, vars: AnyVariables = {}): string {
    return render(`ERROR: ${msg}`, vars);
  }

  static info(msg: string, vars: AnyVariables = {}): string {
    return render(`INFO: ${msg}`, { ...vars, ...CONSOLE_COLORS });
  }

  static list(msg: string, vars: AnyVariables = {}): string {
    return render(` • ${msg}`, vars);
  }

  static skip(msg: string, vars: AnyVariables = {}): string {
    return render(`  SKIP: ${msg}`, vars);
  }

  static text(msg: string, vars: AnyVariables = {}): string {
    return render(msg, vars);
  }

  static warn(msg: string, vars: AnyVariables = {}): string {
    return render(`WARN: ${msg}`, vars);
  }
}
