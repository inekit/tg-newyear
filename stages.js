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

const stages = new Composer();
stages.use(mainStage.middleware());

module.exports = stages;
