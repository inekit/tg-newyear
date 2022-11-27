const {
  Telegraf,
  Composer,
  Scenes: { WizardScene },
} = require("telegraf");
const sendResHandler = new Composer(),
  confirmHandler = new Composer();
const tOrmCon = require("../../db/connection");

const scene = new WizardScene("gaScene", sendResHandler, confirmHandler);

scene.enter(async (ctx) => {
  let { edit, main_menu_button } = ctx.scene.state;

  const connection = await tOrmCon;
  const lastGa = (
    await connection
      .query(
        "select * from get_money_appointments wa where status = 'issued' order by datetime_created limit 1"
      )
      .catch((e) => {})
  )?.[0];

  if (main_menu_button) await ctx.replyWithKeyboard("⚙️", main_menu_button);

  if (!lastGa) {
    if (edit) return ctx.editMenu("NO_NEW_GA", "update_keyboard");

    return ctx.replyWithKeyboard("NO_NEW_GA", "update_keyboard");
  }

  const keyboard = { name: "ga_keyboard", args: [lastGa.id] };
  const title = ctx.getTitle("GA_INFO", [lastGa.id, lastGa.sum, lastGa.bank]);

  await ctx.replyWithPhoto(lastGa.reciept_photo_id).catch((e) => {});

  if (edit) return ctx.editMenu(title, keyboard);

  return ctx.replyWithKeyboard(title, keyboard);
});

scene.action(/^reject\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const connection = await tOrmCon;

  connection
    .query(
      "update get_money_appointments set status = 'rejected' where id = $1 returning customer_id, sum",
      [ctx.match[1]]
    )
    .then((res) => {
      const customer_id = res[0]?.[0]?.customer_id;
      const sum = res[0]?.[0]?.sum;

      ctx.telegram
        .sendMessage(
          customer_id,
          ctx.getTitle("GA_REJECTED", [ctx.match[1], sum])
        )
        .catch((e) => {});

      ctx.scene.enter("gaScene");
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
});

scene.action("reload", async (ctx) => {
  await ctx.answerCbQuery("RELOADED").catch(console.log);

  ctx.scene.enter("gaScene", { edit: false });
});

scene.action(/^aproove\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  //ctx.wizard.state.claim_id = ctx.match[1];

  const connection = await tOrmCon;

  connection
    .query(
      "update get_money_appointments set status = 'aprooved' where id = $1 returning customer_id, sum",
      [ctx.match[1]]
    )
    .then((res) => {
      const customer_id = res[0]?.[0]?.customer_id;
      const sum = res[0]?.[0]?.sum;

      connection
        .query(
          "update users set balance_rub = balance_rub + $1 where id = $2",
          [sum, customer_id]
        )
        .catch(console.log);

      ctx.telegram
        .sendMessage(
          customer_id,
          ctx.getTitle("GA_APROOVED", [ctx.match[1], sum])
        )
        .catch((e) => {});

      ctx.scene.enter("gaScene");
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
});

module.exports = scene;
