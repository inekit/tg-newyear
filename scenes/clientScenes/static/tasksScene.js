const {
  Composer,
  Scenes: { BaseScene },
} = require("telegraf");

const scene = new BaseScene("tasksScene");
const main_menu_button = "admin_back_keyboard";
const getUser = require("../../../Utils/getUser");
const tOrmCon = require("../../../db/connection");
async function getCategories(user_id) {
  const connection = await tOrmCon;

  const is_add_available = (
    await connection
      .query(
        `select (count(r.id) >= 10 or not(max(user_id) ISNULL)) is_add_available
        from reports r left join users u on r.customer_id = u.id left join admins a on a.user_id = u.id
        where status = 'aprooved' and customer_id = $1
        limit 1`,
        [user_id]
      )
      .catch((e) => {
        console.log(e);
      })
  )?.[0]?.is_add_available;

  //console.log(1, is_add_available);

  const categories = await connection
    .query(
      `select *
      from categories c order by id ASC`
    )
    .catch((e) => {
      console.log(e);
    });

  if (!is_add_available)
    return categories?.filter((el) => el.name !== "Дополнительно");
  else return categories;
}
scene.enter(async (ctx) => {
  const { edit, category_id, category_name } = ctx.scene.state;
  let keyboard;
  let title;

  const c_temp = await getCategories(ctx.from.id);

  ctx.scene.state.categories = ctx.scene.state.categories ?? c_temp;
  keyboard = {
    name: "categories_list_keyboard",
    args: [ctx.scene.state.categories],
  };

  title = ctx.getTitle("CHOOSE_CATEGORY");

  if (!ctx.scene.state.categories?.length) {
    await ctx.replyWithTitle("NO_CATEGORIES_ADDED");
    return ctx.scene.enter("clientScene", { visual: false });
  }

  if (edit) return ctx.editMenu(title, keyboard);

  await ctx.replyWithKeyboard("⚙️", "main_menu_back_keyboard");
  ctx.replyWithKeyboard(title, keyboard);
});

scene.action("go_back_tasks", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("tasksScene");
});

scene.action(/^category\-([0-9]+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  const category_id = (ctx.scene.state.category_id = ctx.match[1]);

  const { link, name, photo, instruction, description } =
    (ctx.scene.state.category = ctx.scene.state.categories.find(
      (el) => el.id == category_id
    ));

  await ctx.replyWithPhoto(photo).catch((e) => {});

  return await ctx.replyWithKeyboard(
    "STATIC_TASKS_TITLE",
    {
      name: "tasks_keyboard",
      args: [link, category_id],
    },
    [name, description]
  );
});

scene.action(/instructions\_(.+)/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const { link, name, photo, instruction, description } =
    ctx.scene.state.category;

  await ctx.replyWithKeyboard(instruction, {
    name: "tasks_keyboard",
    args: [link, ctx.scene.state.category_id, true],
  });
});

scene.action(/done\_(.+)/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("sendReportScene", { static_id: ctx.match[1] });
});

module.exports = scene;
