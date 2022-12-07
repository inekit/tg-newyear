const {
  Telegraf,
  Composer,
  Scenes: { WizardScene, BaseScene },
} = require("telegraf");
const titles = require("telegraf-steps-engine/middlewares/titles");
const moment = require("moment");
const categoryHandler = new Composer(),
  subCategoryHandler = new Composer(),
  itemHandler = new Composer();
const scene = new BaseScene("catalogScene");

const tOrmCon = require("../../db/connection");

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
    from categories c order by id desc`
    )
    .catch((e) => {
      console.log(e);
    });

  if (!is_add_available)
    return categories?.filter((el) => el.name !== "Дополнительно");
  else return categories;
}

async function getItems(categoryId) {
  const connection = await tOrmCon;

  return await connection
    .query(
      `select *
    from items i where i.category_id = $1`,
      [categoryId]
    )
    .catch((e) => {
      console.log(e);
    });
}

scene.enter(async (ctx) => {
  const { edit, category_id, category_name } = ctx.scene.state;
  let keyboard;
  let title;

  if (category_id) {
    console.log(category_id, category_name);
    ctx.scene.state.items =
      ctx.scene.state.items ?? (await getItems(category_id));
    ctx.scene.state.category_name = category_name;

    keyboard = {
      name: "items_list_keyboard",
      args: [ctx.scene.state.items],
    };
    title = ctx.getTitle("CHOOSE_ITEM", [
      category_name ?? "",
      ctx.scene.state.category_name ?? "",
    ]);
  } else {
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
  }

  if (edit) return ctx.editMenu(title, keyboard);

  await ctx.replyWithKeyboard("⚙️", "main_menu_back_keyboard");
  ctx.replyWithKeyboard(title, keyboard);
});

scene.hears(titles.getValues("BUTTON_GO_BACK_TASKS"), async (ctx) => {
  await ctx.scene.enter("catalogScene");
});

scene.action(/^category\-([0-9]+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  const category_id = (ctx.scene.state.category_id = ctx.match[1]);

  const category_name = (ctx.scene.state.category_name =
    ctx.scene.state.categories.find((el) => el.id == category_id)?.name);

  const items = (ctx.scene.state.items = await getItems(category_id));

  if (!ctx.scene.state.items?.length) {
    await ctx.replyWithTitle("NO_ITEMS_ADDED");
    return ctx.scene.enter("clientScene", { visual: false });
  }

  ctx.editMenu(ctx.getTitle("CHOOSE_ITEM", [category_name]), {
    name: "items_list_keyboard",
    args: [items],
  });
});

scene.action(/^item\-([0-9]+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  const item_id = (ctx.scene.state.item_id = ctx.match[1]);

  const items = ctx.scene.state.items;

  const { id, name, description, instruction, price, link, photo } = items.find(
    (el) => el.id == item_id
  );
  await ctx.replyWithPhoto(photo).catch((e) => {});
  await ctx.replyWithKeyboard(
    "ITEM_TITLE",
    { name: "item_keyboard", args: [id, link ?? "google.com"] },
    [name, description, price]
  );
});

scene.action(/instruction_(.+)/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  const item_id = ctx.match[1];

  const { instruction, link } =
    ctx.scene.state.items.find((el) => el.id == item_id) ?? {};

  ctx.replyWithKeyboard(instruction, {
    name: "instruction_keyboard",
    args: [item_id, link ?? "google.com"],
  });
});

scene.action(/done_(.+)/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  const item_id = ctx.match[1];

  ctx.scene.enter("sendReportScene", { item_id });
});

scene.action("back", async (ctx) => {
  ctx.answerCbQuery().catch(console.log);

  if (ctx.scene.state.item_id) {
    delete ctx.scene.state;
    ctx.scene.enter("catalogScene", {
      //edit: true,
      category_name: ctx.scene.state.category_name,
      category_id: ctx.scene.state.category_id,
    });
  } else if (ctx.scene.state.category_id) {
    delete ctx.scene.state;
    ctx.scene.enter("catalogScene", { edit: true });
  }
});

module.exports = scene;
