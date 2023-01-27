import * as fs from "fs";
import * as fsp from "fs/promises";
import { injectable } from "inversify";

// "fs/promises" module wrapper to get typed DI
export interface IFileSystemWrapper {
  access(path: string): Promise<void>;
  cp(src: string, dest: string, opts?: fs.CopyOptions): Promise<void>;
  mkdir(path: string, opts?: fs.MakeDirectoryOptions): Promise<string>;
  readFile(path: string): Promise<Buffer>;
  rm(path: string, opts?: fs.RmOptions): Promise<void>;
}

@injectable()
export class NodeFS implements IFileSystemWrapper {
  access(path: string) {
    return fsp.access(path);
  }

  cp(src: string, dest: string, opts?: fs.CopyOptions) {
    return fsp.cp(src, dest, opts);
  }

  mkdir(path: string, opts?: fs.MakeDirectoryOptions) {
    return fsp.mkdir(path, opts);
  }

  readFile(path: string) {
    return fsp.readFile(path);
  }

  rm(path: string, opts?: fs.RmOptions) {
    return fsp.rm(path, opts);
  }
}

@injectable()
export class MockFS implements IFileSystemWrapper {
  access() {
    return Promise.resolve();
  }

  cp() {
    return Promise.resolve();
  }

  mkdir() {
    return Promise.resolve("");
  }

  readFile() {
    return Promise.resolve(Buffer.from(""));
  }

  rm() {
    return Promise.resolve();
  }
}
