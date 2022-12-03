const {
  Telegraf,
  Composer,
  Scenes: { WizardScene },
} = require("telegraf");
const {
  CustomWizardScene,
  titles,
  createKeyboard,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");

const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("gaScene").enter(async (ctx) => {
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

  ctx.wizard.state.appointment_id = ctx.match[1];

  ctx.replyStep(1);
});

scene.action("reload", async (ctx) => {
  await ctx.answerCbQuery("RELOADED").catch(console.log);

  ctx.scene.enter("gaScene", { edit: false });
});

scene.action(/^aproove\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const connection = await tOrmCon;

  connection
    .query(
      "update get_money_appointments set status = 'aprooved' where id = $1 returning customer_id, sum",
      [ctx.match[1]]
    )
    .then(async (res) => {
      const customer_id = res[0]?.[0]?.customer_id;
      const sum = res[0]?.[0]?.sum;

      await connection
        .query(
          "update users set balance_rub = balance_rub + $1 where id = $2",
          [sum, customer_id]
        )
        .catch(console.log);

      await ctx.telegram
        .sendMessage(
          customer_id,
          ctx.getTitle("GA_APROOVED", [ctx.match[1], sum])
        )
        .catch((e) => {});

      delete ctx.wizard.state;

      ctx.scene.enter("gaScene");
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
});

async function rejectAppointment(ctx) {
  const appointment_id = ctx.wizard.state.appointment_id;
  const reason = ctx.wizard.state.reason;
  const reasonMes = reason ? "\n\n Причина: " + reason : " ";

  const connection = await tOrmCon;

  connection
    .query(
      "update get_money_appointments set status = 'rejected' where id = $1 returning customer_id, sum",
      [appointment_id]
    )
    .then(async (res) => {
      const customer_id = res[0]?.[0]?.customer_id;
      const sum = res[0]?.[0]?.sum;

      await ctx.telegram
        .sendMessage(
          customer_id,
          ctx.getTitle("GA_REJECTED", [appointment_id, sum, reasonMes])
        )
        .catch((e) => {});

      delete ctx.wizard.state;
      ctx.scene.enter("gaScene");
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
}

scene
  .addStep({
    variable: "none",
    cb: (ctx) => {},
  })
  .addSelect({
    variable: "reason",
    options: { "Без причины": "no" },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      rejectAppointment(ctx);
    },
    onInput: (ctx) => {
      ctx.wizard.state.reason = ctx.message.text;

      rejectAppointment(ctx);
    },
  })
  .addStep({
    variable: "none2",
    cb: (ctx) => {},
  });

module.exports = scene;
