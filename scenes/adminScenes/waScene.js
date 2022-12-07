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
const { customTransactMiddleware } = require("../../Utils/transact");

const tOrmCon = require("../../db/connection");

const scene = new CustomWizardScene("waScene").enter(async (ctx) => {
  let { edit, waiting, main_menu_button } = ctx.scene.state;

  const connection = await tOrmCon;
  const query = waiting
    ? "select * from withdrawal_appointments wa where status = 'waiting' order by datetime_created limit 1"
    : "select * from withdrawal_appointments wa where status = 'issued' order by datetime_created limit 1";
  const lastWa = (await connection.query(query).catch((e) => {}))?.[0];

  if (main_menu_button) await ctx.replyWithKeyboard("⚙️", main_menu_button);

  if (!lastWa) {
    if (edit) return ctx.editMenu("NO_NEW_WA", "update_keyboard");

    return ctx.replyWithKeyboard("NO_NEW_WA", "update_keyboard");
  }

  await ctx.replyWithPhoto(lastWa.item_photo_id).catch((e) => {
    console.log(e);
  });

  const keyboard = { name: "wa_keyboard", args: [lastWa.id] };

  const title = ctx.getTitle("WA_INFO", [
    lastWa.id,
    lastWa.sum,
    lastWa.withdrawal_address,
  ]);

  if (edit) return ctx.editMenu(title, keyboard);

  return ctx.replyWithKeyboard(title, keyboard);
});

scene
  .addStep({
    variable: "none",
    cb: (ctx) => {},
  })
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
  });

scene.action(/^reject\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.wizard.state.appointment_id = ctx.match[1];

  ctx.replyStep(1);
});

async function rejectAppointment(ctx) {
  const appointment_id = ctx.wizard.state.appointment_id;
  const reason = ctx.wizard.state.reason;
  const reasonMes = reason ? "\n\n Причина: " + reason : " ";

  const connection = await tOrmCon;

  connection
    .query(
      "update withdrawal_appointments set status = 'rejected' where id = $1 returning customer_id, sum",
      [appointment_id]
    )
    .then(async (res) => {
      const customer_id = res[0]?.[0]?.customer_id;
      const sum = res[0]?.[0]?.sum;

      //console.log(customer_id, sum, appointment_id, reasonMes);

      await connection
        .query(
          "update users set balance_rub = balance_rub + $2 where id = $1",
          [customer_id, sum]
        )
        .catch(console.log);

      await ctx.telegram
        .sendMessage(
          customer_id,
          ctx.getTitle("WA_REJECTED", [appointment_id, sum, reasonMes])
        )
        .catch((e) => {
          console.log(e);
        });

      ctx.scene.enter("waScene", {
        edit: false,
        waiting: ctx.wizard.state.waiting,
      });

      delete ctx.wizard.state;
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
}

scene.action(/^wait\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const connection = await tOrmCon;

  connection
    .query(
      "update withdrawal_appointments set status = 'waiting' where id = $1 returning customer_id, sum",
      [ctx.match[1]]
    )
    .then((res) => {
      ctx.scene.enter("waScene", {
        edit: false,
        waiting: ctx.wizard.state.waiting,
      });
    })
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });
});

scene.action(/^skip-\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("waScene");
});

scene.action("reload", async (ctx) => {
  await ctx.answerCbQuery("RELOADED").catch(console.log);

  ctx.scene.enter("waScene", {
    edit: false,
    waiting: ctx.wizard.state.waiting,
  });
});

scene.action(/^aproove\-([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const connection = await tOrmCon;

  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();

  await queryRunner.startTransaction();

  try {
    const res = await queryRunner.query(
      "update withdrawal_appointments set status = 'aprooved' where id = $1 returning customer_id, sum, withdrawal_address",
      [ctx.match[1]]
    );

    const { customer_id, sum, withdrawal_address } =
      (ctx.scene.state.appointment_data = res[0]?.[0]);

    const status = await customTransactMiddleware(
      withdrawal_address,
      sum,
      "toCard",
      customer_id
    );

    await ctx.telegram
      .sendMessage(
        customer_id,
        ctx.getTitle("WA_APROOVED", [ctx.match[1], sum])
      )
      .catch((e) => {});

    await queryRunner.commitTransaction();
  } catch (err) {
    console.log(err);
    ctx.replyWithTitle(err.message ?? "DB_ERROR");

    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();

    ctx.scene.enter("waScene", {
      edit: false,
      waiting: ctx.wizard.state.waiting,
    });
  }
});

module.exports = scene;
