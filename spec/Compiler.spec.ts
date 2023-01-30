import "reflect-metadata";
import { Container } from "inversify";
import { basename } from "path";

import { IFileSystemHelper, MockFileSystemHelper } from "../lib/classes/FileSystemHelper";
import { ILogger, MockLogger } from "../lib/classes/Logger";
// import { IRenderer, MockRenderer } from "../lib/classes/Renderer";
import { Messages } from "../lib/classes/Messages";

import { Config } from "../lib/interfaces";
import { DI_TOKENS } from "../lib/tokens";
import { Compiler } from "../lib/classes/Compiler";
import { version } from "mustache";
import { DEFAULTS } from "../lib/constants";
import { MessagesEnum } from "../messages";

describe("class Compiler", async () => {
  let testContainer: Container;

  const mockConfig: Config = {
    locale: "en",
    tailwind: true,
    theme: "minimalistic",
  };

  const mockStatusFiles = ["403.json", "404.json"];
  const mockSnippetFiles = ["nginx.conf"];
  const mockStatusCodes = new Set([403, 404]);

  beforeEach(() => {
    testContainer = new Container({ defaultScope: "Singleton" });
    testContainer.bind<Config>(DI_TOKENS.CONFIG).toConstantValue(mockConfig);
    testContainer.bind<IFileSystemHelper>(DI_TOKENS.FS_HELPER).to(MockFileSystemHelper);
    testContainer.bind<ILogger>(DI_TOKENS.LOGGER).to(MockLogger);
  });

  describe("initTemplateVariables()", async () => {
    it("should be resolved to default template variables", async () => {
      const version = "7.7.7";

      const fsHelperMock: Partial<IFileSystemHelper> = {
        readJson: async <T>() => ({ version } as T),
      };
      testContainer.rebind<Partial<IFileSystemHelper>>(DI_TOKENS.FS_HELPER).toConstantValue(fsHelperMock);

      const compiler = testContainer.resolve(Compiler);
      await expectAsync(compiler.initTemplateVariables()).toBeResolvedTo({ locale: mockConfig.locale, version });
    });
  });

  describe("getStatusList()", async () => {
    it("should be resolved to Set of mocked status codes", async () => {
      const fsHelperMock: Partial<IFileSystemHelper> = {
        readDir: async () => mockStatusFiles,
      };
      testContainer.rebind<Partial<IFileSystemHelper>>(DI_TOKENS.FS_HELPER).toConstantValue(fsHelperMock);

      const compiler = testContainer.resolve(Compiler);
      await expectAsync(compiler.getStatusList()).toBeResolvedTo(mockStatusCodes);
    });

    it("should be resolved to filtered Set of mocked status codes", async () => {
      const fsHelperMock: Partial<IFileSystemHelper> = {
        readDir: async () => [...mockStatusFiles, "1234.json", "foo.json", "bar.txt"],
      };
      testContainer.rebind<Partial<IFileSystemHelper>>(DI_TOKENS.FS_HELPER).toConstantValue(fsHelperMock);

      const compiler = testContainer.resolve(Compiler);
      await expectAsync(compiler.getStatusList()).toBeResolvedTo(mockStatusCodes);
    });

    it("should be executed with one readDir() call", async () => {
      const fsHelperMock = testContainer.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);
      fsHelperMock.readDir = jasmine.createSpy("readDir", fsHelperMock.readDir).and.resolveTo(mockStatusFiles);
      testContainer.rebind<Partial<IFileSystemHelper>>(DI_TOKENS.FS_HELPER).toConstantValue(fsHelperMock);

      const compiler = testContainer.resolve(Compiler);
      await compiler.getStatusList();

      // Next call with cache usage
      await compiler.getStatusList();

      expect(fsHelperMock.readDir).toHaveBeenCalledTimes(1);
    });
  });

  describe("makePages()", async () => {
    it("should be created two pages", async () => {
      const commonVars = { common: "ABC" };
      const statusVars = { status: "XYZ" };

      const fsHelperMock: Partial<IFileSystemHelper> = {
        readDir: async () => mockStatusFiles,
        readFile: async () => "{{ code }}: {{ common }} => {{ status }}",
        readJson: async <T>(path: string) => {
          const file = basename(path);
          if (file === "package.json") {
            return { version } as T;
          } else if (file === "common.json") {
            return commonVars as T;
          } else if (mockStatusFiles.includes(file)) {
            return { ...statusVars, code: Number(file.replace(",json", "")) } as T;
          }
        },
        writeFile: async () => null,
      };
      testContainer.rebind<Partial<IFileSystemHelper>>(DI_TOKENS.FS_HELPER).toConstantValue(fsHelperMock);

      const logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
      spyOn(logger, "print");

      spyOn(fsHelperMock, "writeFile");

      const compiler = testContainer.resolve(Compiler);
      await expectAsync(compiler.makePages()).toBeResolved();

      expect(logger.print).toHaveBeenCalledWith(Messages.info(MessagesEnum.COMPILE_PAGES));

      Array.from(mockStatusCodes).forEach((code) => {
        const path = `${DEFAULTS.DIST}/${code}.html`;
        const data = `${code}: ${commonVars.common} => ${statusVars.status}`;

        expect(logger.print).toHaveBeenCalledWith(Messages.list(path));
        expect(fsHelperMock.writeFile).toHaveBeenCalledWith(path, data);
      });
    });
  });

  describe("makeConfigs()", async () => {
    it("should be created one config file", async () => {
      const fsHelperMock: Partial<IFileSystemHelper> = {
        readDir: async (path: string) => {
          if (path === `${DEFAULTS.SRC}/${mockConfig.locale}/`) {
            return mockStatusFiles;
          } else if (path === `${DEFAULTS.SNIPPETS}/`) {
            return mockSnippetFiles;
          }
        },
        readFile: async () => "config snippet for {{#codes}}{{.}} {{/codes}}",
        readJson: async <T>(path: string) => {
          const file = basename(path);
          if (mockStatusFiles.includes(file)) {
            return { code: Number(file.replace(",json", "")) } as T;
          }
        },
        writeFile: async () => null,
      };
      testContainer.rebind<Partial<IFileSystemHelper>>(DI_TOKENS.FS_HELPER).toConstantValue(fsHelperMock);

      const logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
      spyOn(logger, "print");

      spyOn(fsHelperMock, "writeFile");

      const compiler = testContainer.resolve(Compiler);
      await expectAsync(compiler.makeConfigs()).toBeResolved();

      expect(logger.print).toHaveBeenCalledWith(Messages.info(MessagesEnum.COMPILE_CONFIGS));

      Array.from(mockSnippetFiles).forEach((snippet) => {
        const path = `${DEFAULTS.DIST}/${snippet}`;
        const data = `config snippet for ${Array.from(mockStatusCodes).join(" ")} `;

        expect(logger.print).toHaveBeenCalledWith(Messages.list(path));
        expect(fsHelperMock.writeFile).toHaveBeenCalledWith(path, data);
      });
    });
  });

  describe("failure scenarios", async () => {
    let compiler: Compiler;
    let logger: ILogger;
    const fsHelperMock: Partial<IFileSystemHelper> = {
      readDir: async () => [],
    };

    beforeEach(() => {
      testContainer.rebind<Partial<IFileSystemHelper>>(DI_TOKENS.FS_HELPER).toConstantValue(fsHelperMock);

      compiler = testContainer.resolve(Compiler);

      logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
      spyOn(logger, "print");
    });

    it("makePages() should be rejected", async () => {
      await expectAsync(compiler.makePages()).toBeRejectedWithError(Messages.error(MessagesEnum.NO_SOURCE_DATA));
      expect(logger.print).toHaveBeenCalledWith(Messages.info(MessagesEnum.COMPILE_PAGES));
    });

    it("makeConfigs() should be rejected", async () => {
      await expectAsync(compiler.makeConfigs()).toBeRejectedWithError(Messages.error(MessagesEnum.NO_SOURCE_DATA));
      expect(logger.print).toHaveBeenCalledWith(Messages.info(MessagesEnum.COMPILE_CONFIGS));
    });
  });
});
