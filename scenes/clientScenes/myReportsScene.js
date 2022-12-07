const {
  Telegraf,
  Composer,
  Scenes: { WizardScene, BaseScene },
} = require("telegraf");
const titles = require("telegraf-steps-engine/middlewares/titles");
const scene = new BaseScene("myReportsScene");
const moment = require("moment");
const tOrmCon = require("../../db/connection");

async function getItems(customer_id) {
  const connection = await tOrmCon;

  return await connection
    .query(
      `select r.*, i.name item_name, i.price, c.name static_name from reports r 
      left join items i on r.item_id = i.id 
      left join users u on r.customer_id = u.id
      left join categories c on r.static_id = c.id 
      where customer_id  = $1`,
      [customer_id]
    )
    .catch((e) => {
      console.log(e);
    });
}

scene.enter(async (ctx) => {
  const { edit } = ctx.scene.state;

  ctx.scene.state.items =
    ctx.scene.state.items ?? (await getItems(ctx.from.id));

  let keyboard = {
    name: "reports_list_keyboard",
    args: [ctx.scene.state.items],
  };

  let title = ctx.getTitle("CHOOSE_REPORT");

  if (edit) return ctx.editMenu(title, keyboard);

  await ctx.replyWithKeyboard("⚙️", "main_menu_back_keyboard");
  ctx.replyWithKeyboard(title, keyboard);
});

scene.action(/^item\-([0-9]+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  const item_id = (ctx.scene.state.item_id = ctx.match[1]);

  const items = ctx.scene.state.items;

  const {
    id,
    status,
    datetime_created,
    item_name,
    static_name,
    price,
    item_photo_id,
  } = items.find((el) => el.id == item_id);
  await ctx.replyWithPhoto(item_photo_id).catch((e) => {});
  await ctx.replyWithKeyboard("REPORT_TITLE", "go_back_keyboard", [
    id,
    item_name ?? static_name,
    price ? price + "р" : "неуказанную цену",
    status === "aprooved"
      ? "одобрено"
      : status === "rejected"
      ? "отклонено"
      : "на проверке",
    moment(datetime_created).locale("ru").format("lll"),
  ]);
});

scene.action("go_back", async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  delete ctx.scene.state;
  ctx.scene.enter("myReportsScene");
});

module.exports = scene;
