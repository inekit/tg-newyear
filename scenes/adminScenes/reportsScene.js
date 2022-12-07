const {
  Telegraf,
  Composer,
  Scenes: { WizardScene },
} = require("telegraf");
const {
  CustomWizardScene,
  titles,
  createKeyboard,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");

const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("reportsScene").enter(async (ctx) => {
  let { edit, main_menu_button } = ctx.scene.state;

  const connection = await tOrmCon;
  const lastReport = (
    await connection
      .query(
        "select * from reports where status = 'issued' order by datetime_created limit 1"
      )
      .catch((e) => {})
  )?.[0];

  if (main_menu_button) await ctx.replyWithKeyboard("⚙️", main_menu_button);

  if (!lastReport) {
    if (edit) return ctx.editMenu("NO_NEW_REPORT", "update_keyboard");

    return ctx.replyWithKeyboard("NO_NEW_REPORT", "update_keyboard");
  }
  ctx.scene.state.item_id = lastReport.item_id;

  const keyboard = { name: "reports_keyboard", args: [lastReport.id] };
  const title = ctx.getTitle("REPORT_INFO", [
    lastReport.id,
    lastReport.customer_id,
    lastReport.item_id,
  ]);

  await ctx.replyWithPhoto(lastReport.item_photo_id).catch((e) => {});

  if (edit) return ctx.editMenu(title, keyboard);

  return ctx.replyWithKeyboard(title, keyboard);
});

scene.action(/^reject\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.wizard.state.appointment_id = ctx.match[1];

  ctx.replyStep(1);
});

scene.action("reload", async (ctx) => {
  await ctx.answerCbQuery("RELOADED").catch(console.log);

  ctx.scene.enter("reportsScene", { edit: false });
});

scene.action(/^aproove\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const connection = await tOrmCon;
  ctx.wizard.state.sum = (
    await connection
      .query("select * from items where id = $1 limit 1", [
        ctx.scene.state.item_id,
      ])
      .catch(console.log)
  )?.[0]?.price;

  ctx.wizard.state.appointment_id = ctx.match[1];

  if (!ctx.wizard.state.sum) return ctx.replyStep(2);

  aprooveAppointment(ctx);
});

async function aprooveAppointment(ctx) {
  const appointment_id = ctx.wizard.state.appointment_id;
  const sum = ctx.wizard.state.sum;

  const connection = await tOrmCon;

  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();

  await queryRunner.startTransaction();

  try {
    const { customer_id, item_id } = (
      await queryRunner.query(
        "update reports set status = 'aprooved' where id = $1 returning customer_id, item_id",
        [appointment_id]
      )
    )[0][0];
    //
    const { referer_1, referer_2, referer_3 } = (
      await queryRunner.query(
        `SELECT u2.id referer_1, u3.id referer_2, u4.id referer_3
        FROM users u 
          left join users u2 on u2.id = u.referer_id
          left join users u3 on u3.id = u2.referer_id
          left join users u4 on u4.id = u3.referer_id
        where u.id = $1`,
        [customer_id]
      )
    )[0];

    await queryRunner.query(
      `update users set balance_rub = balance_rub + $1 where id = $2`,
      [sum, customer_id]
    );
    await queryRunner.query(
      `update users set balance_rub = balance_rub + $1 where id = $2`,
      [(sum / 2).toFixed(0), referer_1]
    );
    await queryRunner.query(
      `update users set balance_rub = balance_rub + $1 where id = $2`,
      [(sum / 4).toFixed(0), referer_2]
    );
    await queryRunner.query(
      `update users set balance_rub = balance_rub + $1 where id = $2`,
      [(sum / 10).toFixed(0), referer_3]
    );

    await ctx.telegram
      .sendMessage(
        customer_id,
        ctx.getTitle("REPORT_APROOVED", [appointment_id, sum])
      )
      .catch((e) => {});

    referer_1 &&
      (await ctx.telegram
        .sendMessage(
          referer_1,
          ctx.getTitle("REFERAL_DEDUCTIONS", [(sum / 2).toFixed(0)])
        )
        .catch((e) => {}));

    referer_2 &&
      (await ctx.telegram
        .sendMessage(
          referer_2,
          ctx.getTitle("REFERAL_DEDUCTIONS", [(sum / 4).toFixed(0)])
        )
        .catch((e) => {}));

    referer_3 &&
      (await ctx.telegram
        .sendMessage(
          referer_3,
          ctx.getTitle("REFERAL_DEDUCTIONS", [(sum / 10).toFixed(0)])
        )
        .catch((e) => {}));

    await queryRunner.commitTransaction();
  } catch (err) {
    console.log(err);
    ctx.replyWithTitle("DB_ERROR");

    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    delete ctx.wizard.state;

    ctx.scene.enter("reportsScene");
  }
}

async function rejectAppointment(ctx) {
  const appointment_id = ctx.wizard.state.appointment_id;
  const reason = ctx.wizard.state.reason;
  const reasonMes = reason ? "\n\n Причина: " + reason : " ";

  const connection = await tOrmCon;

  connection
    .query(
      "update reports set status = 'rejected' where id = $1 returning customer_id",
      [appointment_id]
    )
    .then(async (res) => {
      const customer_id = res[0]?.[0]?.customer_id;
      const sum = res[0]?.[0]?.sum;

      await ctx.telegram
        .sendMessage(
          customer_id,
          ctx.getTitle("REPORT_REJECTED", [appointment_id, sum, reasonMes])
        )
        .catch((e) => {});

      delete ctx.wizard.state;
      ctx.scene.enter("reportsScene");
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
}

scene
  .addNullStep()
  .addSelect({
    variable: "reason",
    options: { "Без причины": "no" },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      rejectAppointment(ctx);
    },
    onInput: (ctx) => {
      ctx.wizard.state.reason = ctx.message.text;

      rejectAppointment(ctx);
    },
  })
  .addStep({
    variable: "sum_report",
    cb: async (ctx) => {
      ctx.wizard.state.sum = ctx.message.text;

      aprooveAppointment(ctx);
    },
  });

module.exports = scene;
