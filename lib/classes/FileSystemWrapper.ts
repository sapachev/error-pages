import * as fs from "fs";
import * as fsp from "fs/promises";
import { injectable } from "inversify";

interface WriteOptions {
  flag?: string;
}

// "fs/promises" module wrapper to get typed DI
export interface IFileSystemWrapper {
  access(path: string): Promise<void>;
  cp(src: string, dest: string, opts?: fs.CopyOptions): Promise<void>;
  mkdir(path: string, opts?: fs.MakeDirectoryOptions): Promise<string>;
  readDir(path: string): Promise<string[]>;
  readFile(path: string): Promise<Buffer>;
  rm(path: string, opts?: fs.RmOptions): Promise<void>;
  writeFile(path: string, data: string, opts?: WriteOptions);
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

  readDir(path: string) {
    return fsp.readdir(path);
  }

  readFile(path: string) {
    return fsp.readFile(path);
  }

  rm(path: string, opts?: fs.RmOptions) {
    return fsp.rm(path, opts);
  }

  writeFile(path: string, data: string, opts?: WriteOptions) {
    return fsp.writeFile(path, data, opts);
  }
}

@injectable()
export class MockFS implements IFileSystemWrapper {
  async access() {
    return null;
  }

  async cp() {
    return null;
  }

  async mkdir() {
    return "";
  }

  async readFile() {
    return Buffer.from("");
  }

  async readDir() {
    return [];
  }

  async rm() {
    return null;
  }

  async writeFile() {
    return null;
  }
}
