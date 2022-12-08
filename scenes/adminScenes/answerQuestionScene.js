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

const scene = new CustomWizardScene("answerQuestionScene").enter(
  async (ctx) => {
    let { edit, main_menu_button } = ctx.scene.state;

    const connection = await tOrmCon;

    const questions = await connection
      .query(
        `select customer_id, username from questions 
        left join users on questions.customer_id = users.id where status = 'sent' group by customer_id,username`
      )
      .catch((e) => {
        console.log(e);
      });

    //select * from questions where answer_id ISNULL and customer_id = $1 order by datetime_sent

    const keyboard = { name: "questions_keyboard", args: [questions] };
    const title = "CHOOSE_QUESTION";

    if (main_menu_button) await ctx.replyWithKeyboard("⚙️", main_menu_button);

    if (!questions?.length) {
      return ctx.replyWithKeyboard("NO_NEW_QUESTIONS", "update_keyboard");
    }

    if (edit) return ctx.editMenu(title, keyboard);

    return ctx.replyWithKeyboard(title, keyboard);
  }
);

scene.addNullStep().addStep({
  variable: "answer",
  cb: async (ctx) => {
    const answer_text = ctx.message.text;

    const customer_id = ctx.scene.state.customer_id;

    if (answer_text.length > 255)
      return ctx.replyWithTitle("TRY_AGAIN_LENGTH_255");

    const connection = await tOrmCon;

    connection
      .getRepository("Answer")
      .save({
        customer_id,
        answerer_id: ctx.from.id,
        text: answer_text,
      })
      .then(async (res) => {
        connection
          .query(
            "update questions set status = 'answered' where customer_id = $1",
            [customer_id]
          )
          .catch(console.log);

        await ctx.telegram.sendMessage(
          customer_id,
          ctx.getTitle("NEW_ANSWER", [answer_text])
        );

        ctx.replyWithKeyboard("ANSWER_SENT", "go_back_keyboard");
      })
      .catch(async (e) => {
        console.log(e);
        ctx.replyWithTitle("DB_ERROR");
      });
  },
});

scene.action("reload", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("answerQuestionScene");
});

scene.action(/^question\_([0-9]+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  const connection = await tOrmCon;

  const qForAnswer = await connection
    .query(
      "select * from questions left join users on questions.customer_id = users.id where status='sent' and customer_id = $1 order by datetime_sent",
      [ctx.match[1]]
    )
    .catch(async (e) => {
      console.log(e);
      ctx.replyWithTitle("DB_ERROR");
    });

  const qForAnswersStr = qForAnswer?.map((el) => el.text).join("\n\n");

  const from = qForAnswer?.[0]?.username;

  ctx.scene.state.customer_id = qForAnswer?.[0]?.customer_id;

  ctx.wizard.cursor = 1;

  ctx.replyWithKeyboard(
    from +
      ":\n\n" +
      qForAnswersStr +
      "\n\nНапишите в чат, чтобы ответить клиенту",
    "go_back_keyboard"
  );
});

scene.action("go_back", async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.enter("answerQuestionScene");
});

module.exports = scene;
