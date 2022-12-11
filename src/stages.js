const {
  Telegraf,
  Scenes: { Stage },
  Composer,
} = require("telegraf");
const titles = require("telegraf-steps").titlesGetter(__dirname + "/Titles");

const mainStage = new Stage([...require("./scenes/mainScene")], {
  default: "clientScene",
});

mainStage.start(async (ctx) => ctx.scene.enter("clientScene"));

const adminStage = new Stage([]);

mainStage.hears(titles.getValues("BUTTON_BACK_ADMIN"), (ctx) => {
  console.log(1);
  ctx.scene.enter("adminScene");
});

adminStage.hears(
  titles.getValues("BUTTON_ADMIN_MENU"),
  (ctx) =>
    store.isAdmin(ctx?.from?.id) &&
    ctx.scene.enter("adminScene", { edit: true })
);

const stages = new Composer();

stages.use(Telegraf.chatType("private", mainStage.middleware()));
stages.use(Telegraf.chatType("private", adminStage.middleware()));

module.exports = stages;
