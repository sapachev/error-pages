import "reflect-metadata";

import chokidar from "chokidar";
import { readFileSync } from "fs";
import Koa from "koa";
import Stream from "stream";

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

  const watcher = chokidar.watch([`${pr.get("src")}/**`, `${pr.get("theme")}/**`], {
    persistent: true,
  });

  // Hot-reload feature over Server-sent events (SSE)
  app.use((ctx, next) => {
    if ("/events" == ctx.path) {
      ctx.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      ctx.status = 200;

      const stream = new Stream.PassThrough();
      ctx.body = stream;

      stream.write("data: init\n\n");

      const sseHandler = (path) => {
        stream.write("data: reload (" + path + ")\n\n");
      };

      watcher.on("add", sseHandler).on("change", sseHandler).on("unlink", sseHandler).on("addDir", sseHandler).on("unlinkDir", sseHandler);

      ctx.req.on("close", () => {
        stream.end();
      });
    } else {
      return next();
    }
  });

  // Read template in a root
  app.use(async (ctx, next) => {
    if ("/" == ctx.path) {
      try {
        let template = await fsHelper.readFile(pr.join("theme", "template.html"));
        ctx.body = template;
        return next();
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
      ctx.body = ctx.body.replace(/<\/(head|body)>/gi, "{{ $1-injection }}</$1>");
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
          "head-injection": `<script src="https://cdn.tailwindcss.com/3.2.4"></script>`,
          "body-injection": readFileSync("./dev/sse.html").toString(),
        };

        if (await fsHelper.ensure(pr.get("themeConfig"))) {
          const tailwindConfig = require(pr.get("themeConfig"));
          devVars["head-injection"] += `<script>tailwind.config = ${JSON.stringify(tailwindConfig)};</script>`;
        }

        if (await fsHelper.ensure(pr.get("themeCss"))) {
          const mainCss = await fsHelper.readFile(pr.get("themeCss"));
          devVars["head-injection"] += `<style type="text/tailwindcss">${mainCss}</style>`;
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
