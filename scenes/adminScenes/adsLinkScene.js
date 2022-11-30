const {
  Telegraf,
  Composer,
  Markup,
  Scenes: { WizardScene },
} = require("telegraf");
const tOrmCon = require("../../db/connection");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const {
  CustomWizardScene,
  titles,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");

const updateAdd = (ctx) => {
  ctx.scene.state.input.author_id = ctx.from?.id;
  const kb = (ctx.scene.state.input.keyboard = [[], []]);
  ctx.scene.state.input.links?.split(/\r\n|\n|\r/).forEach((linkStr) => {
    const [name, link] = linkStr.split(/\s+/);
    if (name && link) {
      kb[0].push(name ?? link);
      kb[1].push(link);
    }
  });
  return; //store.addAdd(ctx.scene.state.input)
};

const scene = new CustomWizardScene("adsLinkScene");

scene.enter(async (ctx) => {
  const { edit, main_menu_button, client_id } = ctx.scene.state;

  const ads = []; //(await query("GET_ADS", ctx.from.id).catch(console.log)) ?? [];

  const keyboard = { name: "ads_list_keyboard", args: [ads] };
  const title = "CHOOSE_ADD";

  if (main_menu_button) await ctx.replyWithKeyboard("⚙️", main_menu_button);

  if (edit) return ctx.editMenu(title, keyboard);

  return ctx.replyWithKeyboard(title, keyboard);
});

scene
  .action(/^add\-([0-9]+)$/g, async (ctx) => {
    ctx.answerCbQuery().catch(console.log);

    ctx.replyWithKeyboard("CHOOSE_ADD_ACTION", {
      name: "custom_keyboard",
      args: [
        ["BUTTON_DELETE", "BUTTON_BACK"],
        [`delete-${ctx.match[1]}`, "back"],
      ],
    });
  })
  .addStep({ startFrom: 0, variable: "text", header: "ENTER_ADD_TEXT" })
  .addStep({
    variable: "links",
    skipTo: "finish",
    skipText: "Без ссылок",
  })
  .addSelect({
    variable: "finish",
    options: { Подтвердить: "confirm" },
    cb: async (ctx) => {
      console.log(1111, ctx.scene.state.input);

      const { links, text } = ctx.scene.state.input;

      let kb = (ctx.scene.state.input.keyboard = [[], []]);
      links?.split(/\r\n|\n|\r/).forEach((linkStr) => {
        const [name, link] = linkStr.split(/\s+/);
        if (name && link) {
          kb[0].push(name ?? link);
          kb[1].push(link);
        }
      });

      let kbs = [];

      kb[0]?.forEach((name, i) => {
        console.log(11, name, kb[1]);
        kbs.push(Markup.button.url(name, kb[1][i]));
      });

      const connection = await tOrmCon;

      const users = await connection
        .query("select id from users")
        .catch((e) => {});

      for (user of users) {
        let message = await ctx.telegram
          .sendMessage(
            user.id,
            text
              .replaceAll(
                /(\#)/g,
                function replacer(match, p1, offset, string) {
                  return `\\${p1}`;
                }
              )
              .replaceAll(".", "\\."),
            {
              parse_mode: "MarkdownV2",
              reply_markup: kbs.length
                ? {
                    inline_keyboard: [kbs],
                  }
                : undefined,
            }
          )
          .catch((e) => {
            console.log(e);
          });
        await delay(50);
      }
    },
  });

scene.action("back", async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.scene.reenter();
});

scene.action(/^delete\-([0-9]+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  /*await updates.customUpdate(
    ctx,
    "ADD",
    (action = "delete"),
    (sceneName = "adsLinkScene"),
    async (ctx) => {}
  ); //await store.deleteAdd(ctx.match[1]), reaction = 'cb')*/
});

scene.action("addAdd", async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  ctx.replyStep(0);
});

module.exports = scene;
