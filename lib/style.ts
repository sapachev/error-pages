import { promisify } from "util";
import { exec } from "child_process";

import { DEFAULTS } from "./constants";
import { Config } from "./interfaces";

export const TAILWIND_STYLE = /\.tcss$/i;

export async function buildTailwind(config: Config) {
  if (config.tailwind) {
    const input = `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_ENTRY}`;
    const output = `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_ENTRY.replace(".tcss", ".css")}`;
    const cmd = `INPUT="${input}" OUTPUT="${output}" npm run build:tailwind`;

    console.log(`INFO: build Tailwind CSS styles`);
    console.log(`INFO: run '${cmd}'`);

    await promisify(exec)(cmd).then(() => {
      console.log(`INFO: Tailwind CSS styles were built`);
    });
  } else {
    console.log(`WARN: Tailwind CSS was disabled in config`);
  }
}

export function sourceStyleFilter(path: string): boolean {
  // Tailwind styles filter
  return !TAILWIND_STYLE.test(path);
}
