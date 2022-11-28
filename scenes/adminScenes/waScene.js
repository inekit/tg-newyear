const {
  Telegraf,
  Composer,
  Scenes: { WizardScene },
} = require("telegraf");
const sendResHandler = new Composer(),
  confirmHandler = new Composer();
const tOrmCon = require("../../db/connection");

const scene = new WizardScene("waScene", sendResHandler, confirmHandler);

scene.enter(async (ctx) => {
  let { edit, main_menu_button } = ctx.scene.state;

  console.log(edit);

  const connection = await tOrmCon;
  const lastWa = (
    await connection
      .query(
        "select * from withdrawal_appointments wa where status = 'issued' order by datetime_created limit 1"
      )
      .catch((e) => {})
  )?.[0];

  if (main_menu_button) await ctx.replyWithKeyboard("⚙️", main_menu_button);

  if (!lastWa) {
    if (edit) return ctx.editMenu("NO_NEW_WA", "update_keyboard");

    return ctx.replyWithKeyboard("NO_NEW_WA", "update_keyboard");
  }

  const keyboard = { name: "wa_keyboard", args: [lastWa.id] };

  const sumToPay = (Number((lastWa.sum * 1.25).toFixed(0)) + 0.11).toFixed(2);

  const title = ctx.getTitle("WA_INFO", [
    lastWa.id,
    sumToPay,
    lastWa.withdrawal_address,
  ]);

  if (edit) return ctx.editMenu(title, keyboard);

  return ctx.replyWithKeyboard(title, keyboard);
});

scene.action(/^skip-\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("waScene");
});

scene.action("reload", async (ctx) => {
  await ctx.answerCbQuery("RELOADED").catch(console.log);

  ctx.scene.enter("waScene", { edit: false });
});

scene.action(/^aproove\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  //ctx.wizard.state.claim_id = ctx.match[1];

  const connection = await tOrmCon;

  connection
    .query(
      "update withdrawal_appointments set status = 'aprooved' where id = $1 returning customer_id, sum",
      [ctx.match[1]]
    )
    .then((res) => {
      const customer_id = res[0]?.[0]?.customer_id;
      const sum = res[0]?.[0]?.sum;

      ctx.telegram
        .sendMessage(
          customer_id,
          ctx.getTitle("WA_APROOVED", [ctx.match[1], sum])
        )
        .catch((e) => {});

      ctx.scene.enter("waScene");
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
});

sendResHandler.action(/^status\-(.+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.wizard.state.claim_res = ctx.match[1];

  //ctx.replyWithKeyboard("CONFIRM", "confirm_keyboard");

  //ctx.wizard.next();
});

confirmHandler.action("confirm", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const { claim_id, claim_res } = ctx.wizard.state;

  ctx.replyWithTitle("FINE_NOT_SENT");

  ctx.scene.reenter();
});

module.exports = scene;
