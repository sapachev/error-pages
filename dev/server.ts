import "reflect-metadata";

import Koa from "koa";

import { ICompiler } from "../lib/classes/Compiler";
import { IFileSystemHelper } from "../lib/classes/FileSystemHelper";
import { Messages } from "../lib/classes/Messages";
import { Renderer } from "../lib/classes/Renderer";

import { initContainer } from "../container";
import { MessagesEnum } from "../messages";
import { pr } from "../path-registry";

import { DEFAULTS } from "../lib/constants";
import { Config, TemplateVariables } from "../lib/interfaces";
import { DI_TOKENS } from "../lib/tokens";

const runContainer = initContainer();

const fsHelper = runContainer.get<IFileSystemHelper>(DI_TOKENS.FS_HELPER);

fsHelper.readConfig(pr.get("config")).then(async (config) => {
  runContainer.bind<Config>(DI_TOKENS.CONFIG).toConstantValue(config);

  // Registry update with new paths, which depends on current config
  pr.update({
    src: `${DEFAULTS.SRC}/${config.locale}`,
    theme: `${DEFAULTS.THEMES}/${config.theme}`,
    themeConfig: `${DEFAULTS.THEMES}/${config.theme}/theme.tailwind.config.js`,
    themeCss: `${DEFAULTS.THEMES}/${config.theme}/@assets/css/main.twnd.css`,
  });

  // Server setup
  const app = new Koa();

  // Read template in a root
  app.use(async (ctx, next) => {
    if ("/" == ctx.path) {
      try {
        let template = await fsHelper.readFile(pr.join("theme", "template.html"));
        ctx.body = template;
        await next();
      } catch (_) {
        ctx.status = 500;
        ctx.body = Messages.text(MessagesEnum.NO_TEMPLATE_CONTENT);
      }
    } else {
      ctx.status = 301;
    }
  });

  // Inject development variables
  app.use(async (ctx, next) => {
    if (ctx.body) {
      ctx.body = ctx.body.replace(/<\/(head|body)>/gi, "{{ $1 }}</$1>");
      await next();
    } else {
      ctx.status = 204;
    }
  });

  // Render variables in template
  app.use(async (ctx, next) => {
    if (ctx.body) {
      const compiler = runContainer.get<ICompiler>(DI_TOKENS.COMPILER);

      try {
        const initVars = await compiler.initTemplateVariables();
        const commonVars = await fsHelper.readJson<TemplateVariables>(pr.join("src", "common.json"));
        const statusVars = await fsHelper.readJson<TemplateVariables>(pr.join("src", `${config.devCode}.json`));

        const devVars = {
          head: `<script src="https://cdn.tailwindcss.com/3.2.4"></script>`,
        };

        if (await fsHelper.ensure(pr.get("themeConfig"))) {
          const tailwindConfig = require(pr.get("themeConfig"));
          devVars.head += `<script>tailwind.config = ${JSON.stringify(tailwindConfig)};</script>`;
        }

        if (await fsHelper.ensure(pr.get("themeCss"))) {
          const mainCss = await fsHelper.readFile(pr.get("themeCss"));
          devVars.head += `<style type="text/tailwindcss">${mainCss}</style>`;
        }

        ctx.body = Renderer.renderTemplate(ctx.body, { ...initVars, ...commonVars, ...statusVars, ...devVars, code: config.devCode });

        await next();
      } catch (err) {
        ctx.status = 500;
        ctx.body = err;
      }
    } else {
      ctx.status = 204;
    }
  });

  const port = 8080;
  app.listen(port);
  console.log(`Dev server started on port ${port}`);
});
