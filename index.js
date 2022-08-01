const { Telegraf, session } = require("telegraf");
const { readFileSync } = require("fs");
const stages = require("./stages");
const shortcuts = require("telegraf-steps-engine/shortcuts/shortcuts");
const middlewares = require("telegraf-steps-engine/middlewares/middlewares");
require("dotenv").config();
//const LocalSession = require('telegraf-session-local')
const fs = require("fs");
const allowed_updates = ["message", "callback_query", "chat_member"];
const TOKEN = process.env.BOT_TOKEN;

const bot = new Telegraf(TOKEN);

console.log("started");

(async () => {
  Object.assign(bot.context, shortcuts, middlewares);

  const ctx = { ...bot.context, telegram: bot.telegram };

  bot.use(
    session(),
    /*(new LocalSession({ 
           database: 'PublicStorage/sessions.json',
           storage: LocalSession.storageFileAsync,
           
         })).middleware(),*/
    stages
  );

  if ("production" === "production") {
    bot.catch(console.error);

    const secretPath = `/telegraf/${bot.secretPathComponent()}`;

    console.log(secretPath);

    const tlsOptions = {
      key: fs.readFileSync("/etc/ssl/certs/rootCA.key"),
      cert: fs.readFileSync("/etc/ssl/certs/rootCA.crt"),
      ca: [
        // This is necessary only if the client uses a self-signed certificate.
        fs.readFileSync("/etc/ssl/certs/185.178.47.201.crt"),
      ],
    };

    bot.telegram
      .setWebhook(`${process.env.SERVER_URI}${secretPath}`, {
        certificate: { source: fs.readFileSync("/etc/ssl/certs/rootCA.crt") },
        allowed_updates,
        drop_pending_updates: true,
      })
      .then((r) => {
        console.log(r);
      });

    //    console.log(await ctx.telegram.getWebhookInfo());
    await bot.startWebhook(secretPath, tlsOptions, 443);

    console.log(await ctx.telegram.getWebhookInfo());
  } else {
    await bot.launch({
      allowedUpdates: allowed_updates,
      dropPendingUpdates: true,
    });
  }
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
