const {
  CustomWizardScene,
  titles,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const tOrmCon = require("../db/connection");

(async () => {
  const connection = await tOrmCon;

  await connection.query(
    "ALTER TABLE users ADD CONSTRAINT brub_check CHECK (balance_rub >= 0)"
  );

  await connection.query(
    "ALTER TABLE users ADD CONSTRAINT bgold_check CHECK (balance_gold >= 0)"
  );
})();

const scene = new CustomWizardScene("clientScene").enter(async (ctx) => {
  let userObj = (ctx.scene.state.userObj = await getUser(ctx));

  //const name = getUserName(ctx);

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

    if (referer_id) {
      connection
        .createQueryBuilder()
        .update("User")
        .set({ balance_gold: () => "balance_gold + 5" })
        .where({ id: referer_id })
        .execute()
        .then((res) => {
          ctx.telegram.sendMessage(
            referer_id,
            ctx.getTitle("NEW_REFERAL", [ctx.from.username])
          );
        })
        .catch(async (e) => {
          console.log(e);
          ctx.replyWithTitle("DB_ERROR");
        });
    }
  }

  ctx.replyWithKeyboard(
    "START_TITLE",
    {
      name: "main_keyboard",
      args: [userObj?.user_id],
    },
    [await getCourse(ctx)]
  );
});

scene.action("connect_support", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  //ctx.scene.enter("connectSupportScene")
});

scene.action(/support\_([0-9]*)/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.replyWithKeyboard(
    `SUPPORT_ANSWER_${ctx.match[1]}`,
    "current_support_keyboard"
  );
});

scene.action("back_to_support", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.replyWithKeyboard("SUPPORT_TITLE", "support_keyboard");
});

scene.action(["referal_menu", "back_to_referal"], async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.replyWithKeyboard("REFERAL_TITLE", "referal_keyboard", [
    ctx.botInfo.username,
    ctx.from.id,
  ]);
});

scene.action("my_referals_menu", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const userObj = (ctx.scene.state.userObj = await getUser(ctx));

  ctx.replyWithKeyboard("MY_REFERALS_TITLE", "my_referals_keyboard", [
    userObj?.referers_count,
  ]);
});

scene.action("back_to_profile", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const userObj = (ctx.scene.state.userObj = await getUser(ctx));

  ctx.replyWithKeyboard("PROFILE_TITLE", "profile_keyboard", [
    ctx.from.first_name ?? ctx.from.username,
    ctx.from.id,
    userObj?.balance_rub,
    userObj?.balance_gold,
    (await getGM(ctx)) ?? 0,
    (await getWSum(ctx)) ?? 0,
  ]);
});

scene.hears(titles.getValues("COURSE_BUTTON"), async (ctx) => {
  ctx.replyWithTitle("COURSE_TITLE", [await getCourse(ctx)]);
});

scene.hears(titles.getValues("SUPPORT_BUTTON"), async (ctx) => {
  ctx.replyWithKeyboard("SUPPORT_TITLE", "support_keyboard");
});

scene.hears(titles.getValues("PROFILE_BUTTON"), async (ctx) => {
  const userObj = (ctx.scene.state.userObj = await getUser(ctx));

  ctx.replyWithKeyboard("PROFILE_TITLE", "profile_keyboard", [
    ctx.from.first_name ?? ctx.from.username,
    ctx.from.id,
    userObj?.balance_rub,
    userObj?.balance_gold,
    (await getGM(ctx)) ?? 0,
    (await getWSum(ctx)) ?? 0,
  ]);
});

scene.hears(titles.getValues("REVIEWS_BUTTON"), async (ctx) => {
  ctx.replyWithTitle("REVIEWS_TITLE", ["spacegoldnews"]);
});

scene.hears(titles.getValues("GET_MONEY_BUTTON"), async (ctx) => {
  ctx.scene.enter("getMoneyScene", {
    course: await getCourse(ctx),
    userObj: await getUser(ctx),
  });
});

scene.hears(titles.getValues("BUY_GOLD_BUTTON"), async (ctx) => {
  const userObj = (ctx.scene.state.userObj = await getUser(ctx));

  if (userObj?.balance_rub <= 0) {
    return ctx.replyWithKeyboard("NO_MONEY", "no_money_keyboard");
  }

  ctx.scene.enter("buyGoldScene", {
    course: await getCourse(ctx),
    userObj,
  });
});

scene.action("get_money", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("getMoneyScene");
});

scene.hears(titles.getValues("WITHDRAWAL_BUTTON"), async (ctx) => {
  const userObj = (ctx.scene.state.userObj = await getUser(ctx));

  if (userObj?.balance_gold < 100) {
    return ctx.replyWithTitle("TRY_AGAIN_MONEY_SUM_MORE_W");
  }
  ctx.scene.enter("withdrawalScene", {
    course: await getCourse(ctx),
    userObj,
  });
});

module.exports = [scene];

async function getGM(ctx) {
  const connection = await tOrmCon;

  let sumObj = await connection
    .query(
      `SELECT sum(sum) sum FROM public.get_money_appointments where customer_id = $1 and status = 'aprooved'`,
      [ctx.from?.id]
    )
    .catch((e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  return sumObj?.[0]?.sum;
}

async function getWSum(ctx) {
  const connection = await tOrmCon;

  let sumObj = await connection
    .query(
      `SELECT sum(sum) sum FROM public.withdrawal_appointments where customer_id = $1 and status = 'aprooved'`,
      [ctx.from?.id]
    )
    .catch((e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  return sumObj?.[0]?.sum;
}

async function getUser(ctx) {
  const connection = await tOrmCon;

  let userObj = await connection
    .query(
      `SELECT u.id,user_id, u.username, u.balance_gold, u.balance_rub, count(ur.id) referers_count
      FROM users u left join admins a on a.user_id = u.id left join users ur on u.id = ur.referer_id
      where u.id = $1
      group by u.id, user_id 
      limit 1`,
      [ctx.from?.id]
    )
    .catch((e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  console.log(
    "balance_log gold rub id",
    userObj?.[0]?.balance_gold,
    userObj?.[0]?.balance_rub,
    userObj?.[0]?.id
  );

  return userObj?.[0];
}

async function getCourse(ctx) {
  const connection = await tOrmCon;

  let staticData = await connection
    .query(`SELECT course FROM static_data s where s.id = 1 limit 1`)
    .catch((e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  console.log(staticData);
  return staticData?.[0]?.course;
}

const getUserName = (ctx) =>
  ctx.from?.first_name ?? ctx.from?.username ?? "Друг";
