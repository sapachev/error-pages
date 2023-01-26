import "reflect-metadata";
import { container } from "tsyringe";

import { FileSystemHelper } from "../lib/FileSystemHelper";
import { Config } from "../lib/interfaces";
import { Messages } from "../lib/Messages";

describe("class FileSystemHelper", async () => {
  let fsHelper: FileSystemHelper;

  const mockObj = { prop: "val" };
  const mockConfig: Config = { locale: "en", tailwind: true, theme: "minimalistic" };

  const registerHelper = (prop: any, value: any): FileSystemHelper => {
    container.register("fs/promise", {
      useValue: {
        [prop]: () => Promise.resolve(value),
      },
    });
    return container.resolve(FileSystemHelper);
  };

  beforeEach(() => {
    container.clearInstances();
  });

  describe("copyAssets()", async () => {
    it("should be resolved with mocked object", async () => {});
  });

  describe("readJson()", async () => {
    it("should be resolved with mocked object", async () => {
      fsHelper = registerHelper("readFile", JSON.stringify(mockObj));
      await expectAsync(fsHelper.readJson("path")).toBeResolvedTo(mockObj);
    });
  });

  describe("readConfig()", async () => {
    it("should be resolved with mocked config", async () => {
      fsHelper = registerHelper("readFile", JSON.stringify(mockConfig));
      await expectAsync(fsHelper.readConfig("path")).toBeResolvedTo(mockConfig);
    });

    it("should be rejected without mandatory property", async () => {
      const msg = "locale";
      spyOn(Messages, "error").and.returnValue(msg);
      fsHelper = registerHelper("readFile", JSON.stringify({ ...mockConfig, locale: undefined }));
      await expectAsync(fsHelper.readConfig("path")).toBeRejectedWithError(msg);
    });
  });
});
