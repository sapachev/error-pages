import { injectable } from "inversify";
import { render } from "mustache";

import { SnippetVariables, TemplateVariables } from "../interfaces";

export interface IRenderer {
  renderPage(template: string, vars: TemplateVariables): string;
  renderSnippet(template: string, vars: SnippetVariables): string;
}

// TODO: change class methods to static
@injectable()
export class Renderer implements IRenderer {
  renderPage(template: string, vars: TemplateVariables) {
    return render(template, vars);
  }

  renderSnippet(template: string, vars: SnippetVariables) {
    return render(template, vars);
  }
}
