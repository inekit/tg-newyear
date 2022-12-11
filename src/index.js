const { Engine, telegraf } = require("telegraf-steps");
require("dotenv").config();
const fs = require("fs");
const allowed_updates = ["message", "callback_query", "chat_member"];
const TOKEN = process.env.BOT_TOKEN;
const express = require("express");
const app = express();
const PORT = 4000;

app.use(express.static("downloads"));

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
const keyboards = {
  ...require("./Keyboards/keyboards"),
  ...require("./Keyboards/inlineKeyboards"),
};

const { bot, ctx, titles } = new Engine(
  TOKEN,
  __dirname + "/Titles",
  keyboards
);

global.titles = titles;

console.log("started");

(async () => {
  bot.use(telegraf.session(), require("./stages"));

  if (process.env.NODE_ENV === "production") {
    bot.catch(console.error);

    const secretPath = `/telegraf/${bot.secretPathComponent()}`;

    console.log(secretPath);

    const tlsOptions = {
      key: fs.readFileSync("/etc/ssl/certs/rootCA.key"),
      cert: fs.readFileSync("/etc/ssl/certs/rootCA.crt"),
      ca: [fs.readFileSync("/etc/ssl/certs/rootCA.crt")],
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

    await bot.startWebhook(secretPath, tlsOptions, 443);

    console.log(await ctx.telegram.getWebhookInfo());
  } else {
    await bot.launch({
      allowedUpdates: allowed_updates,
      dropPendingUpdates: true,
    });
  }

  require("./server")(ctx);
})();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
