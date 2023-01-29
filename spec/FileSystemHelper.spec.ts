import { Container } from "inversify";
import "reflect-metadata";

import { FileSystemHelper } from "../lib/FileSystemHelper";
import { IFileSystemWrapper, MockFS } from "../lib/FileSystemWrapper";
import { Config } from "../lib/interfaces";
import { ILogger, MockLogger } from "../lib/Logger";
import { Messages } from "../lib/Messages";
import { DI_TOKENS } from "../lib/tokens";
import { MessagesEnum } from "../messages";

describe("class FileSystemHelper", async () => {
  let testContainer: Container;

  beforeEach(() => {
    testContainer = new Container({ defaultScope: "Singleton" });
    testContainer.bind<IFileSystemWrapper>(DI_TOKENS.FS).to(MockFS);
    testContainer.bind<ILogger>(DI_TOKENS.LOGGER).to(MockLogger);
  });

  describe("copyAssets()", async () => {
    it("should be called cp() method", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      spyOn(fsWrapper, "cp");

      const logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
      spyOn(logger, "print");

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.copyAssets("SOURCE", "DESTINATION")).toBeResolved();

      expect(fsWrapper.cp).toHaveBeenCalled();
      expect(logger.print).toHaveBeenCalledWith(Messages.info(MessagesEnum.COPYING_ASSETS));
    });

    it("should not be called cp() method", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      fsWrapper.access = jasmine.createSpy("access", fsWrapper.access).and.throwError("");

      spyOn(fsWrapper, "cp");

      const logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
      spyOn(logger, "print");

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.copyAssets("SOURCE", "DESTINATION")).toBeResolved();

      expect(fsWrapper.cp).not.toHaveBeenCalled();
      expect(logger.print).toHaveBeenCalledWith(Messages.warn(MessagesEnum.NO_ASSETS_TO_COPY));
    });
  });

  describe("ensure()", async () => {
    beforeEach(() => {
      testContainer.unbind(DI_TOKENS.FS);
    });

    it("should be resolved to 'true' value", async () => {
      const fsMock: Partial<IFileSystemWrapper> = { access: async () => null };
      testContainer.bind<Partial<IFileSystemWrapper>>(DI_TOKENS.FS).toConstantValue(fsMock);

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.ensure("")).toBeResolvedTo(true);
    });

    it("should be resolved to 'false' value", async () => {
      const fsMock: Partial<IFileSystemWrapper> = {
        access: async () => Promise.reject(),
      };
      testContainer.bind<Partial<IFileSystemWrapper>>(DI_TOKENS.FS).toConstantValue(fsMock);

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.ensure("")).toBeResolvedTo(false);
    });
  });

  describe("flush()", async () => {
    it("should be called rm() and mkdir() methods", async () => {
      const path = "/dev/null";

      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      spyOn(fsWrapper, "rm");
      spyOn(fsWrapper, "mkdir");

      const logger = testContainer.get<ILogger>(DI_TOKENS.LOGGER);
      spyOn(logger, "print");

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.flush(path)).toBeResolved();

      expect(fsWrapper.rm).toHaveBeenCalled();
      expect(fsWrapper.mkdir).toHaveBeenCalled();
      expect(logger.print).toHaveBeenCalledWith(Messages.info(MessagesEnum.FLUSH_DESTINATION, { path }));
    });
  });

  describe("readDir()", async () => {
    const mockStrArr = ["file1", "file2"];

    beforeEach(() => {
      testContainer.unbind(DI_TOKENS.FS);
    });

    it("should be resolved to mocked strings", async () => {
      const fsMock: Partial<IFileSystemWrapper> = {
        access: async () => null,
        readDir: async () => mockStrArr,
      };
      testContainer.bind<Partial<IFileSystemWrapper>>(DI_TOKENS.FS).toConstantValue(fsMock);

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.readDir("path")).toBeResolvedTo(mockStrArr);
    });

    it("should be rejected", async () => {
      const msg = "msg";
      const fsMock: Partial<IFileSystemWrapper> = {
        access: async () => Promise.reject(),
      };
      testContainer.bind<Partial<IFileSystemWrapper>>(DI_TOKENS.FS).toConstantValue(fsMock);

      spyOn(Messages, "error").and.returnValue(msg);

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.readDir("path")).toBeRejectedWithError(msg);
    });
  });

  describe("readFile()", async () => {
    const mockStr = "my string";

    beforeEach(() => {
      testContainer.unbind(DI_TOKENS.FS);
    });

    it("should be resolved to mocked string", async () => {
      const fsMock: Partial<IFileSystemWrapper> = { readFile: async () => Buffer.from(mockStr) };
      testContainer.bind<Partial<IFileSystemWrapper>>(DI_TOKENS.FS).toConstantValue(fsMock);

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.readFile("path")).toBeResolvedTo(mockStr);
    });
  });

  describe("readJson()", async () => {
    const mockObj = { prop: "val" };

    beforeEach(() => {
      testContainer.unbind(DI_TOKENS.FS);
    });

    it("should be resolved to mocked object", async () => {
      const fsMock: Partial<IFileSystemWrapper> = {
        access: async () => null,
        readFile: async () => Buffer.from(JSON.stringify(mockObj)),
      };
      testContainer.bind<Partial<IFileSystemWrapper>>(DI_TOKENS.FS).toConstantValue(fsMock);

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.readJson("path")).toBeResolvedTo(mockObj);
    });

    it("should be resolved to empty object", async () => {
      const fsMock: Partial<IFileSystemWrapper> = {
        access: async () => Promise.reject(),
      };
      testContainer.bind<Partial<IFileSystemWrapper>>(DI_TOKENS.FS).toConstantValue(fsMock);

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.readJson("path")).toBeResolvedTo({});
    });
  });

  describe("readConfig()", async () => {
    const mockConfig: Config = { locale: "en", tailwind: true, theme: "minimalistic" };

    beforeEach(() => {
      testContainer.unbind(DI_TOKENS.FS);
    });

    it("should be resolved to mocked config", async () => {
      const fsMock: Partial<IFileSystemWrapper> = {
        access: async () => null,
        readFile: async () => Buffer.from(JSON.stringify(mockConfig)),
      };
      testContainer.bind<Partial<IFileSystemWrapper>>(DI_TOKENS.FS).toConstantValue(fsMock);

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.readConfig("path")).toBeResolvedTo(mockConfig);
    });

    it("should be rejected without mandatory property", async () => {
      const msg = "locale";

      const fsMock: Partial<IFileSystemWrapper> = {
        readFile: async () => Buffer.from(JSON.stringify({ ...mockConfig, locale: undefined })),
      };
      testContainer.bind<Partial<IFileSystemWrapper>>(DI_TOKENS.FS).toConstantValue(fsMock);

      spyOn(Messages, "error").and.returnValue(msg);

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.readConfig("path")).toBeRejectedWithError(msg);
    });
  });

  describe("writeFile()", async () => {
    it("sould be called writeFile() method", async () => {
      const fsWrapper = testContainer.get<IFileSystemWrapper>(DI_TOKENS.FS);
      spyOn(fsWrapper, "writeFile");

      const fsHelper = testContainer.resolve(FileSystemHelper);
      await expectAsync(fsHelper.writeFile("path", "data")).toBeResolved();

      expect(fsWrapper.writeFile).toHaveBeenCalled();
    });
  });
});
