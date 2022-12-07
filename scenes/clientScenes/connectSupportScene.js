const {
  CustomWizardScene,
  titles,
  createKeyboard,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const {
  go_back_keyboard,
} = require("telegraf-steps-engine/middlewares/inlineKeyboards");
const { replyWithTitle } = require("telegraf-steps-engine/shortcuts/shortcuts");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("connectSupportScene").enter(
  async (ctx) => {
    const { course, edit } = ctx.scene.state;

    if (edit) return ctx.editMenu("ENTER_QUESTION");
    ctx.replyWithKeyboard("ENTER_QUESTION", "main_menu_back_keyboard");
  }
);

scene.addStep({
  variable: "question",
  confines: ["string"],
  cb: async (ctx) => {
    const question_text = ctx.message.text;

    if (question_text.length > 255)
      return ctx.replyWithTitle("TRY_AGAIN_LENGTH_255");

    const connection = await tOrmCon;

    connection
      .getRepository("Question")
      .save({
        customer_id: ctx.from.id,
        text: question_text,
      })
      .then(async (res) => {
        const admins = await connection.getRepository("Admin").find();
        for (admin of admins) {
          await ctx.telegram.sendMessage(
            admin.user_id,
            ctx.getTitle("NEW_QUESTION", [
              ctx.from.username,
              ctx.from.id,
              question_text,
            ])
          );
        }

        ctx.replyWithKeyboard("QUESTION_SENT", "go_back_keyboard");
      })
      .catch(async (e) => {
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });
  },
});

scene.action("go_back", (ctx) => ctx.scene.enter("helpScene", { edit: true }));
module.exports = scene;
