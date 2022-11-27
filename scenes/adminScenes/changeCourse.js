const {
  Telegraf,
  Composer,
  Scenes: { BaseScene },
} = require("telegraf");
const tOrmCon = require("../../db/connection");

const scene = new BaseScene("changeCourse");

scene.enter(async (ctx) => {
  let { edit, main_menu_button } = ctx.scene.state;

  if (main_menu_button) await ctx.replyWithKeyboard("⚙️", main_menu_button);

  const title = "CHANGE_COURSE_TITLE";

  if (edit) return ctx.editMenu(ctx.getTitle(title));

  return ctx.replyWithTitle(ctx.getTitle(title));
});

scene.on("text", async (ctx) => {
  const course = ctx.message.text;
  if (parseInt(course) != course) return ctx.replyWithTitle("WRONG_COURSE");

  const connection = await tOrmCon;

  connection
    .getRepository("Static")
    .save({
      id: 1,
      course,
    })
    .then((res) => {
      ctx.replyWithTitle("COURSE_CHANGED");
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    })
    .finally(() => ctx.scene.enter("adminScene"));
});

module.exports = scene;
