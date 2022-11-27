const {
  CustomWizardScene,
  titles,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("getMoneyScene").enter((ctx) => {
  ctx.replyWithKeyboard("ENTER_MONEY_SUM", "main_menu_back_keyboard");
  ctx.wizard.selectStep(0);
});
const payments = require("../../payments/payments");

scene
  .addStep({
    variable: "money_sum",
    confines: ["number"],
    cb: async (ctx) => {
      if (parseInt(ctx.message.text) != ctx.message.text)
        return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM");

      const { course, userObj } = ctx.scene.state;

      if (parseInt(ctx.message.text) < 65)
        return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM_MORE");

      ctx.wizard.state.input = {};
      const sum = (ctx.wizard.state.input.money_sum = ctx.message.text);
      ctx.replyWithKeyboard("ENTER_PAYMENT_TYPE", "payment_type_keyboard", [
        sum,
        ((sum / course) * 100).toFixed(0),
      ]);
      ctx.wizard.selectStep(1);
    },
  })
  .addSelect({
    variable: "payment_type",
    options: {
      "🥝QIWI": "qiwi",
      "🟢Сбербанк": "sber",
      "🔆Тинькофф": "tinkoff",
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      const payment_type = (ctx.wizard.state.input.payment_type = ctx.match[0]);
      const money_sum = ctx.wizard.state.input.money_sum;

      if (payment_type === "tinkoff") {
        await ctx.replyWithTitle("REQUISITES_BANK", [
          "Тинькофф",
          "4377727816814102",
          money_sum,
        ]);

        ctx.wizard.selectStep(2);
      } else if (payment_type === "sber") {
        await ctx.replyWithTitle("REQUISITES_BANK", [
          "Сбербанк",
          "4276134008375038",
          money_sum,
        ]);

        ctx.wizard.selectStep(2);
      } else {
        const connection = await tOrmCon;
        connection
          .getRepository("GetMoneyAppointment")
          .save({
            customer_id: ctx.from.id,
            sum: money_sum,
            bank: "qiwi",
            status: "notpayed",
          })
          .then(async (res) => {
            if (!res?.id) return;

            const link = payments.createBill(
              "qiwi",
              money_sum,
              "RUB",
              res.id,
              `https://t.me/${ctx.botInfo.username}`
            );

            ctx.replyWithKeyboard(
              "REQUISITES_QIWI",
              {
                name: "pay_qiwi_keyboard",
                args: [link],
              },
              [link, money_sum]
            );
          })
          .catch(async (e) => {
            console.log(e);
            ctx.replyWithTitle("DB_ERROR");
          });
      }
    },
  })
  .addStep({
    variable: "photos",
    type: "action",
    handler: new FilesHandler(async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      const { money_sum, payment_type, photos } = ctx.wizard.state.input;
      const connection = await tOrmCon;
      connection
        .getRepository("GetMoneyAppointment")
        .save({
          customer_id: ctx.from.id,
          sum: money_sum,
          bank: payment_type,
          reciept_photo_id: photos,
        })
        .then(async (res) => {
          const admins = await connection.getRepository("Admin").find();
          for (admin of admins) {
            ctx.telegram.sendMessage(
              admin.user_id,
              ctx.getTitle("NEW_GM_APPOINTMENT", [
                ctx,
                ctx.from.username,
                money_sum,
                payment_type,
              ])
            );
          }

          ctx.replyWithTitle("GM_SENT");
        })
        .catch(async (e) => {
          console.log(e);
          ctx.replyWithTitle("DB_ERROR");
        });
    }),
  });

module.exports = scene;
