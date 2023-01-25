import { access, cp, readFile, rm, mkdir } from "fs/promises";

import { Config } from "./interfaces";
import { sourceStyleFilter } from "./style";

export async function readJson(path: string) {
  return await readFile(path).then(String).then(JSON.parse);
}

export async function existenceCheck(path: string) {
  let exists = false;
  try {
    await access(path);
    exists = true;
  } catch (_) {}
}

export async function readConfig(path: string): Promise<Config> {
  const config = await readJson(path);

  if (!config.theme) {
    throw new Error(`Please set theme in your configuration: ${path}`);
  } else if (!config.locale) {
    throw new Error(`Please set locale in your configuration: ${path}`);
  }

  return config;
}

export async function flush(path: string) {
  console.log(`INFO: prepare build directory '${path}'`);

  await rm(path, { force: true, recursive: true });
  await mkdir(path, { recursive: true });
}

export async function copyAssets(src: string, dst: string) {
  console.log(`INFO: copying assets to build directory`);

  if (existenceCheck(src)) {
    await cp(src, dst, {
      recursive: true,
      filter: sourceStyleFilter,
    });
  } else {
    console.log(`INFO: no assets in current theme directory`);
  }
}
