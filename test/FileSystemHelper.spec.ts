import "reflect-metadata";
import { Container } from "inversify";
import { assert } from "chai";
import * as sinon from "sinon";

import { FileSystemHelper } from "../lib/classes/FileSystemHelper";
import { IFileSystemWrapper, MockFS } from "../lib/classes/FileSystemWrapper";
import { ILogger, MockLogger } from "../lib/classes/Logger";
import { Messages } from "../lib/classes/Messages";

import { Config } from "../lib/models";
import { DI_TOKENS } from "../lib/tokens";
import { MessagesEnum } from "../messages";
import { PathRegistry } from "../lib/classes/PathRegistry";

describe("class FileSystemHelper", async () => {
  let testContainer: Container;
  let fsHelper: FileSystemHelper;
  let printSpy: sinon.SinonSpy;

  const path = "path";

  beforeEach(() => {
    testContainer = new Container({ defaultScope: "Singleton" });
    testContainer.bind<IFileSystemWrapper>(DI_TOKENS.FS).to(MockFS);
    testContainer.bind<ILogger>(DI_TOKENS.LOGGER).to(MockLogger);

    const logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
    printSpy = sinon.spy(logger, "print");

    fsHelper = testContainer.resolve(FileSystemHelper);
  });

  describe("copyAssets()", async () => {
    const pd = new PathRegistry({
      src: "src",
      dest: "dest",
    });

    it("should be called cp() method", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      const cpSpy = sinon.spy(fsWrapper, "cp");

      await fsHelper.copyAssets(pd.get("src"), pd.get("dest"));

      sinon.assert.called(cpSpy);
      sinon.assert.calledWithExactly(printSpy, Messages.info(MessagesEnum.COPYING_ASSETS, { dest: pd.get("dest") }));
    });

    it("should not be called cp() method", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.access = () => Promise.reject();

      const cpSpy = sinon.spy(fsWrapper, "cp");

      await fsHelper.copyAssets(pd.get("src"), pd.get("dest"));

      sinon.assert.notCalled(cpSpy);
      sinon.assert.calledWithExactly(printSpy, Messages.warn(MessagesEnum.NO_ASSETS_TO_COPY));
    });
  });

  describe("ensure()", async () => {
    it("should be resolved to 'true' value", async () => {
      assert.isTrue(await fsHelper.ensure(""));
    });

    it("should be resolved to 'false' value", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.access = () => Promise.reject();

      assert.isFalse(await fsHelper.ensure(""));
    });
  });

  describe("flush()", async () => {
    it("should be called rm() and mkdir() methods", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      const rmSpy = sinon.spy(fsWrapper, "rm");
      const mkdirSpy = sinon.spy(fsWrapper, "mkdir");

      await fsHelper.flush(path);

      sinon.assert.called(rmSpy);
      sinon.assert.called(mkdirSpy);
      sinon.assert.calledWithExactly(printSpy, Messages.info(MessagesEnum.FLUSH_DESTINATION, { path }));
    });
  });

  describe("readDir()", async () => {
    const mockStrArr = ["file1", "file2"];

    it("should be resolved to mocked strings", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.readDir = async () => mockStrArr;

      assert.deepEqual(await fsHelper.readDir(path), mockStrArr);
    });

    it("should be resolved to empty list", async () => {
      assert.deepEqual(await fsHelper.readDir(path), []);
    });

    it("should be rejected with Error", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.access = () => Promise.reject();

      await fsHelper.readDir(path).then(
        () => assert.ok(false),
        (err) => {
          assert.equal(err.message, Messages.text(MessagesEnum.NO_DIRECTORY, { path }));
        }
      );
    });
  });

  describe("readFile()", async () => {
    const mockStr = "my string";

    it("should be resolved to mocked string", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.readFile = async () => Buffer.from(mockStr);

      assert.equal(await fsHelper.readFile(path), mockStr);
    });

    it("should be resolved to empty string", async () => {
      assert.equal(await fsHelper.readFile(path), "");
    });

    it("should be rejected with Error", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.access = () => Promise.reject();

      await fsHelper.readFile(path).then(
        () => assert.ok(false),
        (err) => {
          assert.equal(err.message, Messages.text(MessagesEnum.NO_FILE, { path }));
        }
      );
    });
  });

  describe("readJson()", async () => {
    const mockObj = { prop: "val" };

    it("should be resolved to mocked object", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.readFile = async () => Buffer.from(JSON.stringify(mockObj));

      assert.deepEqual(await fsHelper.readJson(path), mockObj);
    });

    it("should be resolved to empty object", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.access = () => Promise.reject();

      assert.deepEqual(await fsHelper.readJson(path), {});
    });
  });

  describe("readConfig()", async () => {
    const mockConfig: Config = { locale: "en", tailwind: true, theme: "minimalistic" };

    it("should be resolved to mocked config", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.readFile = async () => Buffer.from(JSON.stringify(mockConfig));

      assert.deepEqual(await fsHelper.readConfig(path), mockConfig);
    });

    it("should be rejected without mandatory property", async () => {
      const prop = "locale";

      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.readFile = async () => Buffer.from(JSON.stringify({ ...mockConfig, [prop]: undefined }));

      await fsHelper.readConfig(path).then(
        () => assert.ok(false),
        (err) => {
          assert.equal(err.message, Messages.text(MessagesEnum.NO_CONFIG_PROPERTY, { path, prop }));
        }
      );
    });
  });

  describe("writeFile()", async () => {
    it("sould be called writeFile() method", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      const writeFileSpy = sinon.spy(fsWrapper, "writeFile");

      await fsHelper.writeFile(path, "data");

      sinon.assert.called(writeFileSpy);
    });

    it("sould be called writeFile() method witj optional flag", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      const writeFileSpy = sinon.spy(fsWrapper, "writeFile");

      await fsHelper.writeFile(path, "data", { flag: "r" });

      sinon.assert.calledOnceWithExactly(writeFileSpy, path, "data", { flag: "r" });
    });
  });
});
