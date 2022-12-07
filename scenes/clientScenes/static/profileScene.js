const {
  Composer,
  Scenes: { BaseScene },
} = require("telegraf");

const scene = new BaseScene("profileScene");
const getUser = require("../../../Utils/getUser");
const tOrmCon = require("../../../db/connection");

scene.enter(async (ctx) => {
  const userObj = (ctx.scene.state.userObj = await getUser(ctx));
  const connection = await tOrmCon;

  const issued =
    connection.query(
      `select sum(sum) sum
    from withdrawal_appointments 
    where customer_id = $1 
    and (status = 'issued' or status = 'waiting') 
    group by customer_id`,
      [ctx.from.id]
    )?.[0]?.sum ?? 0;

  const aprooved =
    connection.query(
      `select sum(sum) sum
    from withdrawal_appointments 
    where customer_id = $1 
    and status = 'aprooved'
    group by customer_id`,
      [ctx.from.id]
    )?.[0]?.sum ?? 0;

  ctx.replyWithKeyboard("PROFILE_TITLE", "profile_keyboard", [
    issued,
    userObj?.balance_rub,
    aprooved,
  ]);

  ctx.scene.enter("clientScene", { visual: false });
});

module.exports = scene;
