import { render } from "mustache";

import { SnippetVariables, TemplateVariables } from "../interfaces";

export class Renderer {
  static renderTemplate(template: string, vars: TemplateVariables | SnippetVariables) {
    return render(template, vars);
  }
}
