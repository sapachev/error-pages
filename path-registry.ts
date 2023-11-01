import { PathRegistry } from "./lib/classes/PathRegistry";
import { DEFAULTS } from "./lib/constants";

// Resigstry of resolved paths to usage during the process
export const pr = new PathRegistry({
  assetsDist: `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}`,
  config: DEFAULTS.CONFIG,
  dist: DEFAULTS.DIST,
  package: DEFAULTS.PACKAGE,
  snippets: DEFAULTS.SNIPPETS,
  twndDist: `${DEFAULTS.DIST}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_OUT}`,
});
