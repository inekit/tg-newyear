const {
  CustomWizardScene,
  titles,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const tOrmCon = require("../db/connection");
const getUser = require("../Utils/getUser");

(async () => {
  const connection = await tOrmCon;

  await connection.query(
    "ALTER TABLE users ADD CONSTRAINT brub_check CHECK (balance_rub >= 0)"
  );
})();

const scene = new CustomWizardScene("clientScene").enter(async (ctx) => {
  const { visual = true } = ctx.scene.state;
  let userObj = (ctx.scene.state.userObj = await getUser(ctx));

  const connection = await tOrmCon;

  if (!userObj) {
    const referer_id = /^ref-([0-9]+)$/g.exec(ctx.startPayload)?.[1];
    userObj = await connection
      .getRepository("User")
      .save({
        id: ctx.from.id,
        username: ctx.from.username,
        referer_id,
      })
      .catch(async (e) => {
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });
  }

  visual &&
    ctx.replyWithKeyboard(
      "START_TITLE",
      {
        name: "main_keyboard",
        args: [userObj?.user_id],
      },
      []
    );
});

scene.hears(titles.getValues("INTERNAL_TASKS_BUTTON"), (ctx) =>
  ctx.scene.enter("catalogScene")
);

scene.hears(titles.getValues("TASKS_BUTTON"), (ctx) =>
  ctx.scene.enter("tasksScene")
);

scene.hears(titles.getValues("REFERALS_BUTTON"), (ctx) =>
  ctx.scene.enter("referalsScene")
);

scene.hears(titles.getValues("HELP_BUTTON"), (ctx) =>
  ctx.scene.enter("helpScene")
);

scene.hears(titles.getValues("PROFILE_BUTTON"), (ctx) =>
  ctx.scene.enter("profileScene")
);

scene.hears(titles.getValues("REPORT_BUTTON"), (ctx) =>
  ctx.scene.enter("myReportsScene")
);

scene.action("back_to_profile", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);
  ctx.scene.enter("profileScene");
});

scene.action(["referal_menu", "back_to_referal"], async (ctx) => {
  await ctx.answerCbQuery().catch((e) => {});
  ctx.scene.enter("referalsScene");
});

scene.hears(titles.getValues("WITHDRAWAL_BUTTON"), (ctx) =>
  ctx.scene.enter("withdrawalScene")
);

module.exports = [scene];
