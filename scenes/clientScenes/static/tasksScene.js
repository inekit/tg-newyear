const {
  Composer,
  Scenes: { BaseScene },
} = require("telegraf");

const scene = new BaseScene("tasksScene");
const main_menu_button = "admin_back_keyboard";
const getUser = require("../../../Utils/getUser");
const tOrmCon = require("../../../db/connection");

scene.enter(async (ctx) => {
  await ctx.replyWithKeyboard("⚙️", "main_menu_back_keyboard");

  await ctx.replyWithKeyboard("CHOOSE_TASK_CATEGORY", {
    name: "categories_list_keyboard",
    args: [
      [
        { id: 0, name: "Кредитные карты" },
        { id: 1, name: "Микрокредиты" },
        { id: 2, name: "Инвестиции" },
      ],
    ],
  });
});

scene.action("go_back_tasks", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  await ctx.editMenu("CHOOSE_TASK_CATEGORY", {
    name: "categories_list_keyboard",
    args: [
      [
        { id: 0, name: "Кредитные карты" },
        { id: 1, name: "Микрокредиты" },
        { id: 2, name: "Инвестиции" },
      ],
    ],
  });
});

scene.action(/^category\-([0-9]+)$/g, async (ctx) => {
  ctx.answerCbQuery().catch(console.log);
  const category_id = (ctx.scene.state.category_id = ctx.match[1]);

  if (category_id == 0)
    return await ctx.editMenu("CREDIT_CARDS_TITLE", {
      name: "tasks_keyboard",
      args: ["http://link.ru", "credit"],
    });
  if (category_id == 1)
    return await ctx.editMenu("MICRO_CREDIT_TITLE", {
      name: "tasks_keyboard",
      args: ["http://link.ru", "micro"],
    });
  if (category_id == 2)
    return await ctx.editMenu("INVEST_TITLE", {
      name: "tasks_keyboard",
      args: ["http://link.ru", "invest"],
    });
});

scene.action(/instructions\_(.+)/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  await ctx.replyWithKeyboard("instructions for " + ctx.match[1], {
    name: "tasks_keyboard",
    args: ["http://link.ru", ctx.match[1], true],
  });
});

scene.action(/done\_(.+)/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("sendReportScene");
});

module.exports = scene;
