const {
  CustomWizardScene,
  titles,
  createKeyboard,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const { replyWithTitle } = require("telegraf-steps-engine/shortcuts/shortcuts");
const tOrmCon = require("../../db/connection");
const getUser = require("../../Utils/getUser");

const scene = new CustomWizardScene("withdrawalScene").enter(async (ctx) => {
  const { course } = ctx.scene.state;

  const userObj = (ctx.scene.state.userObj = await getUser(ctx));

  if (userObj?.balance_rub < 10) {
    await ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM_MORE_W");
    return ctx.scene.enter("clientScene", { visual: false });
  }

  ctx.scene.state.sent = false;

  if (userObj?.balance_rub <= 0) {
    return ctx.replyWithTitle("NO_MONEY");
  }

  ctx.replyWithKeyboard(
    "ENTER_WITHDRAWAL_MONEY_SUM",
    "main_menu_back_keyboard"
  );

  ctx.wizard?.selectStep(0);
});

scene
  .addStep({
    variable: "withdrawal_money_sum",
    confines: ["number"],
    cb: async (ctx) => {
      const { course, userObj } = ctx.scene.state;

      ctx.wizard.state.input = {};

      const sum = (ctx.wizard.state.input.money_sum = ctx.message.text);

      if (parseInt(sum) != sum)
        return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM");

      if (parseInt(sum) < 10)
        return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM_MORE_W");

      if (userObj?.balance_rub < sum)
        return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM_BALANCE");

      ctx.replyNextStep();
    },
  })
  .addStep({
    variable: "card_number",
    confines: ["number"],
    cb: async (ctx) => {
      const { course, userObj } = ctx.scene.state;

      const card_number = ctx.message.text;

      if (parseInt(card_number) != card_number)
        return ctx.replyWithTitle("TRY_AGAIN_CARD_NUMBER");

      if (ctx.scene.state.sent) return;

      const { money_sum } = ctx.wizard.state.input;
      const connection = await tOrmCon;

      const sum = money_sum;

      connection
        .getRepository("WAppointment")
        .save({
          customer_id: ctx.from.id,
          sum: money_sum,
          withdrawal_address: card_number,
        })
        .then(async (res) => {
          connection
            .query(
              "update users set balance_rub = balance_rub - $1 where id = $2 returning balance_rub",
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
                    card_number,
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
    },
  });

module.exports = scene;
