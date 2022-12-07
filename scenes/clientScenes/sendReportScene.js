const {
  CustomWizardScene,
  titles,
  createKeyboard,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("sendReportScene").enter(async (ctx) => {
  ctx.scene.state.sent = false;

  ctx.replyWithKeyboard("REPORT_INSTRUCTIONS", "main_menu_back_keyboard");
});

scene.addStep({
  variable: "photos",
  type: "action",
  handler: new FilesHandler(async (ctx) => {
    const { course, item_id, static_id } = ctx.scene.state;

    const { photos } = ctx.wizard.state.input;

    if (ctx.scene.state.sent) return;

    const connection = await tOrmCon;

    connection
      .getRepository("Report")
      .save({
        customer_id: ctx.from.id,
        item_photo_id: photos,
        item_id,
        static_id,
      })
      .then(async (res) => {
        ctx.scene.state.sent = true;

        ctx.replyWithTitle("REPORT_SENT");

        const admins = await connection.getRepository("Admin").find();
        for (admin of admins) {
          ctx.telegram.sendMessage(
            admin.user_id,
            ctx.getTitle("NEW_REPORT", [ctx.from.username, item_id])
          );
        }
      })
      .catch(async (e) => {
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });
  }),
});

module.exports = scene;
