import { render } from "mustache";
import Typograf from "typograf";

import { SnippetVariables, TemplateVariables } from "../models";
import { TYPOGRAF_LOCALES } from "../constants";

export class Renderer {
  static renderTemplate(template: string, vars: TemplateVariables): string {
    if (TYPOGRAF_LOCALES.has(vars.locale)) {
      const tp = new Typograf({ locale: [TYPOGRAF_LOCALES.get(vars.locale)], htmlEntity: { type: "name" } });
      for (const prop in vars) {
        vars[prop] = tp.execute(vars[prop]);
      }
    }
    return render(template, vars, null, { escape: (str) => str });
  }

  static renderSnippet(template: string, vars: SnippetVariables): string {
    return render(template, vars);
  }
}
