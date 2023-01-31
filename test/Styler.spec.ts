import "reflect-metadata";
import { Container } from "inversify";
import { assert } from "chai";
import * as sinon from "sinon";

import { Styler } from "../lib/classes/Styler";
import { IChildProcessWrapper, MockChildProcessWrapper } from "../lib/classes/ChildProcessWrapper";
import { ILogger, MockLogger } from "../lib/classes/Logger";
import { Messages } from "../lib/classes/Messages";

import { DI_TOKENS } from "../lib/tokens";
import { MessagesEnum } from "../messages";

describe("class Styler", async () => {
  let testContainer: Container;
  const input = "ABC";
  const output = "XYZ";

  describe("buildTailwind()", async () => {
    beforeEach(() => {
      testContainer = new Container({ defaultScope: "Singleton" });
      testContainer.bind<IChildProcessWrapper>(DI_TOKENS.CHILD_PROCESS).to(MockChildProcessWrapper);
      testContainer.bind<ILogger>(DI_TOKENS.LOGGER).to(MockLogger);
    });

    it("should be called exec() method and resolved", async () => {
      const cmd = Styler.getTailwindCommand(input, output);

      const childProcess = testContainer.get<IChildProcessWrapper>(DI_TOKENS.CHILD_PROCESS);
      const execSpy = sinon.spy(childProcess, "exec");

      const logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
      const printSpy = sinon.spy(logger, "print");

      const styler = testContainer.resolve(Styler);

      await styler.buildTailwind(input, output);

      sinon.assert.calledOnceWithExactly(execSpy, cmd);
      sinon.assert.calledWithExactly(printSpy, Messages.info(MessagesEnum.TAILWIND_START));
      sinon.assert.calledWithExactly(printSpy, Messages.info(MessagesEnum.TAILWIND_CMD, { cmd }));
      sinon.assert.calledWithExactly(printSpy, Messages.info(MessagesEnum.TAILWIND_DONE));
    });
  });

  describe("static getTailwindCommand()", () => {
    let cmd: string;

    beforeEach(() => {
      cmd = Styler.getTailwindCommand(input, output);
    });

    it(`should contain '${input}' as INPUT variable`, () => {
      assert.isTrue(cmd.includes(`INPUT="${input}"`));
    });

    it(`should contain '${output}' as OUTPUT variable`, () => {
      assert.isTrue(cmd.includes(`OUTPUT="${output}"`));
    });

    it(`should contain 'build:tailwind' script`, () => {
      assert.isTrue(cmd.includes("build:tailwind"));
    });
  });

  describe("static sourceStyleFilter()", () => {
    const testFiles = new Map([
      ["text.txt", true],
      ["main.css", true],
      ["tailwind.css", true],
      ["main.twnd.css", false],
      ["my-custom-tailwind-style.twnd.css", false],
    ]);

    Array.from(testFiles).forEach(([fileName, expected]) => {
      it(`should be equal to '${expected}' for '${fileName}' file as input parameter`, () => {
        assert.equal(Styler.sourceStyleFilter(fileName), expected);
      });
    });
  });
});
