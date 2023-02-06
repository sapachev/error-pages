import { assert } from "chai";
import { Messages } from "../lib/classes/Messages";

describe("class Messages", () => {
  const key = "test";
  const vars = {
    [key]: "TEST",
  };
  const noVarsMsg = "no vars";
  const withVarsMsg = "with var";

  const methods = new Map<string, string>([
    ["error", "ERROR: "],
    ["info", "INFO: "],
    ["list", " • "],
    ["skip", "  SKIP: "],
    ["text", ""],
    ["warn", "WARN: "],
  ]);

  methods.forEach((prefix: string, method: string) => {
    describe(`${method}()`, () => {
      it("should be rendered to formatted string without variables", () => {
        assert.equal(Messages[method](noVarsMsg), `${prefix}${noVarsMsg}`);
      });

      it("should be rendered to formatted string with variables", () => {
        assert.equal(Messages[method](`${withVarsMsg} {{ ${key} }}`, vars), `${prefix}${withVarsMsg} ${vars[key]}`);
      });
    });
  });
});
