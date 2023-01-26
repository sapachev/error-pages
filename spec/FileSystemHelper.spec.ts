import "reflect-metadata";
import { container } from "tsyringe";

import { FileSystemHelper } from "../lib/FileSystemHelper";
import { Config } from "../lib/interfaces";
import { Messages } from "../lib/Messages";
import { depValueRegister } from "./helpers";

describe("class FileSystemHelper", async () => {
  const mockObj = { prop: "val" };
  const mockConfig: Config = { locale: "en", tailwind: true, theme: "minimalistic" };

  beforeEach(() => {
    container.clearInstances();

    depValueRegister("logger", [["print", (m: string) => m]]);
  });

  describe("copyAssets()", async () => {
    it("should be called copy method", async () => {
      // TODO
    });
  });

  describe("readJson()", async () => {
    it("should be resolved with mocked object", async () => {
      depValueRegister("fs/promise", [["readFile", JSON.stringify(mockObj)]]);
      const fsHelper = container.resolve(FileSystemHelper);

      await expectAsync(fsHelper.readJson("path")).toBeResolvedTo(mockObj);
    });
  });

  describe("readConfig()", async () => {
    it("should be resolved with mocked config", async () => {
      depValueRegister("fs/promise", [["readFile", JSON.stringify(mockConfig)]]);
      const fsHelper = container.resolve(FileSystemHelper);

      await expectAsync(fsHelper.readConfig("path")).toBeResolvedTo(mockConfig);
    });

    it("should be rejected without mandatory property", async () => {
      const msg = "locale";
      spyOn(Messages, "error").and.returnValue(msg);

      depValueRegister("fs/promise", [["readFile", JSON.stringify({ ...mockConfig, locale: undefined })]]);
      const fsHelper = container.resolve(FileSystemHelper);

      await expectAsync(fsHelper.readConfig("path")).toBeRejectedWithError(msg);
    });
  });
});
