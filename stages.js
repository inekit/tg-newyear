const {
  Telegraf,
  Scenes: { Stage },
  Composer,
} = require("telegraf");
const { titles } = require("telegraf-steps-engine");

const mainStage = new Stage([...require("./scenes/mainScene")], {
  default: "clientScene",
});

/*mainStage.on("photo", (ctx) => {
  console.log(ctx.message.photo);
})*/

mainStage.start(async (ctx) => {
  ctx.scene.enter("clientScene");
});

mainStage.hears(titles.getValues("BUTTON_BACK_ADMIN"), (ctx) =>
  ctx.scene.enter("adminScene")
);
mainStage.hears(titles.getValues("BUTTON_ADMIN_MENU"), (ctx) =>
  ctx.scene.enter("adminScene")
);
mainStage.hears(titles.getValues("BUTTON_BACK_USER"), (ctx) =>
  ctx.scene.enter("clientScene")
);
mainStage.hears(titles.getValues("BUTTON_ABOUT"), (ctx) =>
  ctx.replyWithKeyboard("HOME_MENU")
);

const stages = new Composer();
stages.use(mainStage.middleware());

module.exports = stages;
