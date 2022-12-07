const {
  Composer,
  Scenes: { BaseScene },
} = require("telegraf");

const scene = new BaseScene("referalsScene");
const getUser = require("../../../Utils/getUser");
const tOrmCon = require("../../../db/connection");

scene.enter(async (ctx) => {
  const userObj = (ctx.scene.state.userObj = await getUser(ctx));

  await ctx.replyWithTitle("REFERALS_TITLE", [
    `t.me/${ctx.botInfo.username}?start=ref-${ctx.from.id}`,
    userObj.referers_1_count,
    userObj.referers_2_count,
    userObj.referers_3_count,
    userObj.total_income_referal,
  ]);

  ctx.scene.enter("clientScene", { visual: false });
});

module.exports = scene;
