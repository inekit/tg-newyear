const {
  CustomWizardScene,
  titles,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("buyGoldScene").enter((ctx) => {
  const { course, userObj } = ctx.scene.state;

  ctx.replyWithKeyboard("BUY_GOLD_TITLE", "main_menu_back_keyboard", [
    course,
    userObj?.balance_rub,
    ((userObj?.balance_rub / 45) * 100).toFixed(0),
  ]);
  ctx.wizard.selectStep(0);
});

scene.addStep({
  variable: "buy_gold_money_sum",
  confines: ["number"],
  cb: async (ctx) => {
    const { course, userObj } = ctx.scene.state;

    ctx.wizard.state.input = {};

    const sum = (ctx.wizard.state.input.money_sum = ctx.message.text);

    if (parseInt(ctx.message.text) != ctx.message.text)
      return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM");

    if (userObj?.balance_rub < sum)
      return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM_BALANCE");

    const goldSum = ((sum / 45) * 100).toFixed(0);

    const connection = await tOrmCon;

    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update("User")
        .set({ balance_rub: () => `balance_rub - ${sum}` })
        .where({ id: ctx.from.id })
        .execute();

      await queryRunner.manager
        .createQueryBuilder()
        .update("User")
        .set({ balance_gold: () => `balance_gold + ${goldSum}` })
        .where({ id: ctx.from.id })
        .execute();

      await queryRunner.commitTransaction();

      await ctx.replyWithTitle("BOUGHT_GOLD_TITLE", [
        sum,
        goldSum,
        Number(userObj?.balance_gold) + Number(goldSum),
      ]);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      console.log(err);
      await ctx.replyWithTitle("DB_ERROR");
    } finally {
      await queryRunner.release();
      return await ctx.scene.enter("clientScene");
    }
  },
});

module.exports = scene;
