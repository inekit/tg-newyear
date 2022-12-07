const { constants } = require("fs/promises");
const {
  Composer,
  Scenes: { WizardScene },
} = require("telegraf");
const idHandler = new Composer(),
  newBalanceHandler = new Composer(),
  noneHandler = new Composer();

const scene = new WizardScene(
  "changeBalanceScene",
  noneHandler,
  idHandler,
  newBalanceHandler
);

const tOrmCon = require("../../db/connection");

scene.enter(async (ctx) => {
  const { edit, main_menu_button } = ctx.scene.state;

  const keyboard = "balance_keyboard";
  const title = ctx.getTitle("CHOOSE_BALANCE");

  if (main_menu_button) await ctx.replyWithKeyboard("⚙️", main_menu_button);

  if (edit) return ctx.editMenu(title, keyboard);
  ctx.replyWithKeyboard(title, keyboard);
});

scene.action("search", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.replyWithTitle("SEND_NEW_ID");
  ctx.wizard.next();
});

idHandler.on("message", async (ctx) => {
  const connection = await tOrmCon;
  let balance;

  const getBalanceById = async (id) => {
    ctx.scene.state.customer_id = id;
    return (
      await connection
        .query("select balance_rub from users where id = $1 limit 1", [id])
        .catch(console.log)
    )?.[0]?.balance_rub;
  };

  if (ctx.message?.forward_from?.id)
    balance = await getBalanceById(ctx.message?.forward_from?.id);
  else if (parseInt(ctx.message?.text) == ctx.message?.text)
    balance = await getBalanceById(ctx.message?.text);
  else {
    ctx.scene.state.customer_username = ctx.message?.text;

    const res = (
      await connection
        .query(
          "select id, balance_rub from users where username = $1 limit 1",
          [ctx.scene.state.customer_username]
        )
        .catch(console.log)
    )?.[0];

    balance = res?.balance_rub;
    ctx.scene.state.customer_id = res?.id;
  }

  if (balance !== undefined) {
    return ctx.replyWithKeyboard(
      "USER_BALANCE_INFO",
      "change_balance_keyboard",
      [balance]
    );
  }

  ctx.replyWithTitle("NO_SUCH_USER");
});

idHandler.action("change", async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});

  ctx.scene.state.canUpdateAdmins = true;
  ctx.replyWithTitle("ENTER_NEW_BALANCE");
  ctx.wizard.next();
});

newBalanceHandler.on("message", async (ctx) => {
  const new_balance = ctx.message?.text;
  const { customer_id } = ctx.scene.state;

  const res = await require("../../Utils/authAdmin")(ctx.from.id, true).catch(
    () => {
      ctx.answerCbQuery("CANT_AUTH");
      return ctx.scene.enter("clientScene");
    }
  );

  if (!res) {
    return ctx.scene.enter("clientScene");
  }

  const connection = await tOrmCon;
  await connection
    .query("update users set balance_rub = $1 where id = $2", [
      new_balance,
      customer_id,
    ])
    .then(async () => {
      await ctx.replyWithTitle("BALANCE_CHANGED");
    })
    .catch(async (e) => {
      console.log(e);
      await ctx.replyWithTitle("DB_ERROR");
    });

  delete ctx.scene.state.newId, ctx.scene.state.canUpdateAdmins;

  ctx.scene.enter("changeBalanceScene");
});

module.exports = scene;
