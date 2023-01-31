import "reflect-metadata";
import { Container } from "inversify";

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
      spyOn(childProcess, "exec");

      const logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
      spyOn(logger, "print");

      const styler = testContainer.resolve(Styler);
      await expectAsync(styler.buildTailwind(input, output)).toBeResolved();

      expect(childProcess.exec).toHaveBeenCalledWith(cmd);
      expect(logger.print).toHaveBeenCalledWith(Messages.info(MessagesEnum.TAILWIND_START));
      expect(logger.print).toHaveBeenCalledWith(Messages.info(MessagesEnum.TAILWIND_CMD, { cmd }));
      expect(logger.print).toHaveBeenCalledWith(Messages.info(MessagesEnum.TAILWIND_DONE));
    });
  });

  describe("static getTailwindCommand()", () => {
    let cmd: string;

    beforeEach(() => {
      cmd = Styler.getTailwindCommand(input, output);
    });

    it(`should contain '${input}' as INPUT variable`, () => {
      expect(cmd.includes(`INPUT="${input}"`)).toBeTrue();
    });

    it(`should contain '${output}' as OUTPUT variable`, () => {
      expect(cmd.includes(`OUTPUT="${output}"`)).toBeTrue();
    });

    it(`should contain 'build:tailwind' script`, () => {
      expect(cmd.includes("build:tailwind")).toBeTrue();
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
        expect(Styler.sourceStyleFilter(fileName)).toBe(expected);
      });
    });
  });
});
