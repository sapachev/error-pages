import { assert } from "chai";

import { Renderer } from "../lib/classes/Renderer";
import { SnippetVariables, TemplateVariables } from "../lib/models";

describe("class Renderer", () => {
  describe("renderTemplate()", () => {
    let template: string, vars: TemplateVariables;

    beforeEach(() => {
      template = "<p>{{ myText }}</p>";
      vars = {
        locale: "en",
        version: "0.0.0",
        myText: "This text is for test",
      };
    });

    it("should be rendered regular html with typographed text", () => {
      const result = Renderer.renderTemplate(template, vars);
      const expected = "<p>This text is&nbsp;for test</p>";
      assert.equal(result, expected);
    });

    it("should be rendered regular html without typography", () => {
      const result = Renderer.renderTemplate(template, { ...vars, locale: "xz" });
      const expected = "<p>This text is for test</p>";
      assert.equal(result, expected);
    });
  });

  describe("renderSnippet()", () => {
    let template: string, vars: SnippetVariables;

    beforeEach(() => {
      template = "{{#codes}}{{.}}, {{/codes}}";
      vars = {
        codes: [1, 2, 3],
      };
    });

    it("should be rendered part of config", () => {
      const result = Renderer.renderSnippet(template, vars);
      const expected = "1, 2, 3, ";
      assert.equal(result, expected);
    });
  });
});
