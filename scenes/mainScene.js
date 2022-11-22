const {
  CustomWizardScene,
  titles,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");

const clientScene = new CustomWizardScene("clientScene").enter(async (ctx) => {
  delete ctx.wizard.state.input;

  ctx.replyWithKeyboard("START_TITLE", "new_appointment_keyboard");
});

clientScene.action("new_appointment", (ctx) => {
  ctx.answerCbQuery().catch((e) => {});
  ctx.replyStep(0);
});

clientScene
  .addSelect({
    variable: "work_type",
    options: {
      Расчетка: "Расчетка",
      "Курсовая работа": "Курсовая работа",
      "Лабораторная работа": "Лабораторная работа",
      "Проектная работа": "Проектная работа",
      "Дипломная работа": "Дипломная работа",
      "Помощь на экзамене": "Помощь на экзамене",
      Шпаргалка: "Шпаргалка",
    },
  })
  .addStep({
    variable: "subject",
  })
  .addSelect({
    variable: "course",
    options: {
      "1 курс": "1",
      "2 курс": "2",
      "3 курс": "3",
      "4 курс": "4",
    },
  })
  .addStep({
    variable: "description",
  })
  .addSelect({
    variable: "deadline",
    options: {
      "1-2 дня": "1-2",
      "1 неделя": "7",
    },
    onInput: (ctx) => {
      if (
        parseInt(ctx.message.text) != ctx.message.text ||
        parseInt(ctx.message.text) > 365
      )
        return ctx.replyWithTitle("ENTER_NUMBER_DEADLINE");

      ctx.wizard.state.input.deadline = ctx.message?.text;

      ctx.replyNextStep();
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      ctx.wizard.state.input.deadline = ctx.match[0];

      ctx.replyNextStep();
    },
  })
  .addStep({
    variable: "files",
    type: "action",
    skipTo: "promo",
    handler: new FilesHandler(async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      ctx.wizard.state.enoughMessageSent = false;

      ctx.replyNextStep();
    }),
  })
  .addSelect({
    variable: "promo",
    options: {
      "У меня нет промокода": "no",
    },
    onInput: async (ctx) => {
      ctx.wizard.state.input.promo = ctx.message.text;

      await sendToAdmin(ctx);

      ctx.replyNextStep();
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      await sendToAdmin(ctx);

      ctx.replyNextStep();
    },
  })
  .addSelect({
    variable: "ending",
    options: {
      "Сделать новый заказ": "new",
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      if (ctx.match[0] === "new") {
        delete ctx.wizard.state.input;
        ctx.replyStep(0);
      }
    },
  });

async function sendToAdmin(ctx) {
  console.log(ctx.wizard.state);

  const admin_id = ctx.getTitle("ADMIN_ID");

  const username = ctx.from.username ? "@" + ctx.from.username : null;

  let main_message;

  const { work_type, subject, course, description, deadline, promo } =
    ctx.wizard.state.input;

  if (!username) {
    const user_message = await ctx.telegram.forwardMessage(
      admin_id,
      ctx.from.id,
      ctx.wizard.state.message_id
    );

    main_message = await ctx.telegram.sendMessage(
      admin_id,
      ctx.getTitle("NEW_APPOINTMENT", [
        username,
        work_type,
        subject,
        course + " курс",
        description,
        deadline.toString() + " дн.",
        promo ?? "Нет",
      ]),
      {
        reply_to_message_id: user_message?.message_id,
        parse_mode: "HTML",
      }
    );
  }

  main_message = await ctx.telegram.sendMessage(
    admin_id,
    ctx.getTitle("NEW_APPOINTMENT", [
      username,
      work_type,
      subject,
      course + " курс",
      description,
      deadline.toString() + " дн.",
      promo ?? "Нет",
    ]),
    { parse_mode: "HTML" }
  );

  if (ctx.wizard.state.input?.documents)
    for (fileId of ctx.wizard.state.input.documents)
      ctx.telegram.sendDocument(admin_id, fileId, {
        reply_to_message_id: main_message?.message_id,
        disable_notification: true,
      });
}

module.exports = [clientScene];
