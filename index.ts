import "reflect-metadata";

import { FileSystemHelper } from "./lib/classes/FileSystemHelper";
import { ILogger } from "./lib/classes/Logger";
import { Main } from "./lib/classes/Main";

import { initContainer } from "./container";
import { pr } from "./path-registry";

import { Config } from "./lib/models";
import { Messages } from "./lib/classes/Messages";
import { MessagesEnum } from "./messages";

import { DEFAULTS } from "./lib/constants";
import { DI_TOKENS } from "./lib/tokens";

const runContainer = initContainer();

runContainer
  .resolve(FileSystemHelper)
  .readConfig(pr.get("config"))
  .then((config) => {
    // Override locale config parameter with environment variable
    if (process.env.LOCALE) {
      config.locale = process.env.LOCALE;
      runContainer.get<ILogger>(DI_TOKENS.LOGGER).print(Messages.warn(MessagesEnum.ENV_LOCALE, { locale: config.locale }));
    }

    runContainer.bind<Config>(DI_TOKENS.CONFIG).toConstantValue(config);

    // Registry update with new paths, which depends on current config
    pr.update({
      assetsSrc: `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}`,
      theme: `${DEFAULTS.THEMES}/${config.theme}`,
      src: `${DEFAULTS.SRC}/${config.locale}`,
      twndSrc: `${DEFAULTS.THEMES}/${config.theme}/${DEFAULTS.ASSETS}/css/${DEFAULTS.TAILWIND_IN}`,
    });

    return runContainer.resolve(Main).start();
  })
  .catch((err) => {
    runContainer.get<ILogger>(DI_TOKENS.LOGGER).print(Messages.error(MessagesEnum.OVERALL, err));
    process.exit(1);
  });
