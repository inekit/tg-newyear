const {
  CustomWizardScene,
  titles,
  createKeyboard,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const { replyWithTitle } = require("telegraf-steps-engine/shortcuts/shortcuts");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("withdrawalScene").enter(async (ctx) => {
  const { course, userObj } = ctx.scene.state;

  ctx.scene.state.sent = false;

  if (userObj?.balance_gold <= 0) {
    //await ctx.replyWithKeyboard("ATTENTION", "main_menu_back_keyboard");
    return ctx.replyWithTitle("NO_MONEY"); //, "no_money_keyboard");
  }

  ctx.replyWithKeyboard(
    "ENTER_WITHDRAWAL_MONEY_SUM",
    "main_menu_back_keyboard"
  );

  ctx.wizard.selectStep(0);
});

scene
  .addStep({
    variable: "withdrawal_money_sum",
    confines: ["number"],
    cb: async (ctx) => {
      ctx.wizard.state.input = {};

      const { course, userObj } = ctx.scene.state;

      const sum = (ctx.wizard.state.input.money_sum = ctx.message.text);

      if (parseInt(sum) != sum)
        return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM");

      if (parseInt(sum) < 100)
        return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM_MORE_W");

      if (userObj?.balance_gold < sum)
        return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM_BALANCE");

      ctx.wizard.selectStep(1);
      const sumToPay = (Number((sum * 1.25).toFixed(0)) + 0.11).toFixed(2);

      ctx.replyWithTitle("WA_SENT", [sumToPay, sum, sumToPay, sum]);
    },
  })
  .addStep({
    variable: "photos",
    type: "action",
    handler: new FilesHandler(async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      if (ctx.scene.state.sent) return;

      const { money_sum, payment_type, photos } = ctx.wizard.state.input;
      const connection = await tOrmCon;

      const sum = money_sum;

      connection
        .getRepository("WAppointment")
        .save({
          customer_id: ctx.from.id,
          sum: money_sum,
          item_photo_id: photos,
          withdrawal_address: "withdrawal_address",
        })
        .then(async (res) => {
          connection
            .query(
              "update users set balance_gold = balance_gold - $1 where id = $2",
              [sum, ctx.from.id]
            )
            .then(async (res) => {
              ctx.scene.state.sent = true;

              ctx.replyWithTitle("WA_SENT_2");

              const admins = await connection.getRepository("Admin").find();
              for (admin of admins) {
                ctx.telegram.sendMessage(
                  admin.user_id,
                  ctx.getTitle("NEW_W_APPOINTMENT", [
                    ctx,
                    ctx.from.username,
                    sum,
                  ])
                );
              }
            })
            .catch(console.log);
        })
        .catch(async (e) => {
          console.log(e);
          ctx.replyWithTitle("DB_ERROR");
        });
    }),
  });

module.exports = scene;
