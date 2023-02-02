import "reflect-metadata";
import { Container } from "inversify";
import { basename } from "path";
import { assert } from "chai";
import * as sinon from "sinon";

import { Compiler } from "../lib/classes/Compiler";
import { IFileSystemHelper, MockFileSystemHelper } from "../lib/classes/FileSystemHelper";
import { ILogger, MockLogger } from "../lib/classes/Logger";
import { Messages } from "../lib/classes/Messages";

import { Config } from "../lib/interfaces";
import { DI_TOKENS } from "../lib/tokens";
import { MessagesEnum } from "../messages";
import { PathRegistry } from "../lib/classes/PathRegistry";

describe("class Compiler", async () => {
  let testContainer: Container;
  let compiler: Compiler;
  let printSpy: sinon.SinonSpy;
  let pr: PathRegistry;

  const mockConfig: Config = {
    locale: "en",
    tailwind: true,
    theme: "minimalistic",
  };

  const mockStatusFiles = ["403.json", "404.json"];
  const mockSnippetFiles = ["nginx.conf"];
  const mockStatusCodes = new Set([403, 404]);
  const version = "7.7.7";

  beforeEach(() => {
    testContainer = new Container({ defaultScope: "Singleton" });
    testContainer.bind<IFileSystemHelper>(DI_TOKENS.FS_HELPER).to(MockFileSystemHelper);
    testContainer.bind<ILogger>(DI_TOKENS.LOGGER).to(MockLogger);
    testContainer.bind<Config>(DI_TOKENS.CONFIG).toConstantValue(mockConfig);

    pr = new PathRegistry({});
    testContainer.bind<PathRegistry>(DI_TOKENS.PATH).toConstantValue(pr);

    const logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
    printSpy = sinon.spy(logger, "print");

    compiler = testContainer.resolve(Compiler);
  });

  describe("initTemplateVariables()", async () => {
    it("should be resolved to default template variables", async () => {
      pr.update({ package: "package" });

      const fsHelper = testContainer.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);
      fsHelper.readJson = async <T>() => ({ version } as T);

      assert.deepEqual(await compiler.initTemplateVariables(), { locale: mockConfig.locale, version });
    });
  });

  describe("getStatusList()", async () => {
    pr.update({ src: "src" });

    it("should be resolved to Set of mocked status codes", async () => {
      const fsHelper = testContainer.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);
      fsHelper.readDir = async () => mockStatusFiles;

      assert.deepEqual(await compiler.getStatusList(), mockStatusCodes);
    });

    it("should be resolved to filtered Set of mocked status codes", async () => {
      const fsHelper = testContainer.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);
      fsHelper.readDir = async () => [...mockStatusFiles, "1234.json", "foo.json", "bar.txt"];

      assert.deepEqual(await compiler.getStatusList(), mockStatusCodes);
    });

    it("should be executed with one readDir() call", async () => {
      const fsHelper = testContainer.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);
      fsHelper.readDir = async () => mockStatusFiles;

      const readDirSpy = sinon.spy(fsHelper, "readDir");

      await compiler.getStatusList();

      // Next call with cache usage
      await compiler.getStatusList();

      sinon.assert.calledOnce(readDirSpy);
    });
  });

  describe("makePages()", async () => {
    it("should be created two pages", async () => {
      pr.update({
        dist: "dist",
        package: "package.json",
        src: "src",
        theme: "theme",
      });

      const commonVars = { common: "ABC" };
      const statusVars = { status: "XYZ" };

      const fsHelper = testContainer.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);
      fsHelper.readDir = async () => mockStatusFiles;
      fsHelper.readFile = async () => "{{ code }}: {{ common }} => {{ status }}";
      fsHelper.readJson = async <T>(path: string) => {
        const file = basename(path);
        if (file === "package.json") {
          return { version } as T;
        } else if (file === "common.json") {
          return commonVars as T;
        } else if (mockStatusFiles.includes(file)) {
          return { ...statusVars, code: Number(file.replace(",json", "")) } as T;
        }
      };

      const writeFileSpy = sinon.spy(fsHelper, "writeFile");

      await compiler.makePages();

      sinon.assert.calledWithExactly(printSpy, Messages.info(MessagesEnum.COMPILE_PAGES));

      Array.from(mockStatusCodes).forEach((code) => {
        const path = pr.join("dist", `${code}.html`);
        const data = `${code}: ${commonVars.common} => ${statusVars.status}`;

        sinon.assert.calledWithExactly(printSpy, Messages.list(path));
        sinon.assert.calledWithExactly(writeFileSpy, path, data);
      });
    });
  });

  describe("makeConfigs()", async () => {
    pr.update({
      dist: "dist",
      src: "src",
      snippets: "snippets",
    });

    it("should be created one config file", async () => {
      const fsHelper = testContainer.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);
      fsHelper.readDir = async (path: string) => {
        if (path === pr.get("src")) {
          return mockStatusFiles;
        } else if (path === pr.get("snippets")) {
          return mockSnippetFiles;
        }
      };
      fsHelper.readFile = async () => "config snippet for {{#codes}}{{.}} {{/codes}}";
      fsHelper.readJson = async <T>(path: string) => {
        const file = basename(path);
        if (mockStatusFiles.includes(file)) {
          return { code: Number(file.replace(",json", "")) } as T;
        }
      };

      const writeFileSpy = sinon.spy(fsHelper, "writeFile");

      await compiler.makeConfigs();

      sinon.assert.calledWithExactly(printSpy, Messages.info(MessagesEnum.COMPILE_CONFIGS));

      Array.from(mockSnippetFiles).forEach((snippet) => {
        const path = pr.join("dist", snippet);
        const data = `config snippet for ${Array.from(mockStatusCodes).join(" ")} `;

        sinon.assert.calledWithExactly(printSpy, Messages.list(path));
        sinon.assert.calledWithExactly(writeFileSpy, path, data);
      });
    });
  });

  describe("failure scenarios", async () => {
    pr.update({ src: "src" });

    beforeEach(() => {
      const fsHelper = testContainer.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);
      fsHelper.readDir = async () => [];
    });

    it("makePages() should be rejected", async () => {
      await compiler.makePages().then(
        () => assert.ok(false),
        (err) => {
          assert.equal(err.message, Messages.text(MessagesEnum.NO_SOURCE_DATA));
        }
      );
      sinon.assert.calledWithExactly(printSpy, Messages.info(MessagesEnum.COMPILE_PAGES));
    });

    it("makeConfigs() should be rejected", async () => {
      await compiler.makeConfigs().then(
        () => assert.ok(false),
        (err) => {
          assert.equal(err.message, Messages.text(MessagesEnum.NO_SOURCE_DATA));
        }
      );
      sinon.assert.calledWithExactly(printSpy, Messages.info(MessagesEnum.COMPILE_CONFIGS));
    });
  });
});
