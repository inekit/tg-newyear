const {
  Composer,
  Scenes: { BaseScene },
} = require("telegraf");

const scene = new BaseScene("helpScene");
const getUser = require("../../../Utils/getUser");
const tOrmCon = require("../../../db/connection");

scene.enter(async (ctx) => {
  const { edit } = ctx.scene.state;

  if (edit) return ctx.editMenu("HELP_TITLE", "help_keyboard");

  await ctx.replyWithKeyboard("⚙️", "main_menu_back_keyboard");

  ctx.replyWithKeyboard("HELP_TITLE", "help_keyboard");
});

scene.action(/help_info_(.+)/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const type = ctx.match[1];
  await ctx.editMenu(
    "HELP_" + type.toUpperCase() + "_TITLE",
    "go_back_subhelp_keyboard"
  );
});

scene.action(/^help\_info|go\_back\_subhelp$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  await ctx.editMenu("CHOOSE_HELP_TITLE", "subhelp_keyboard");
});

scene.action("rules_info", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  await ctx.editMenu("HELP_RULES_TITLE", "go_back_help_keyboard");
});

scene.action("go_back_help", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.editMenu("HELP_TITLE", "help_keyboard");
});

scene.action("connect_support", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("connectSupportScene");
});

module.exports = scene;
