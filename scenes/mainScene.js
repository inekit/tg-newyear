const {
  Telegraf,
  Composer,
  Scenes: { WizardScene },
  Telegram,
} = require("telegraf");

const { CustomWizardScene, titles } = require("telegraf-steps-engine");
const {
  custom_keyboard,
} = require("telegraf-steps-engine/middlewares/inlineKeyboards");
const { confirmDialog } = require("telegraf-steps-engine/replyTemplates");
const clinics = require("../clinics.json");
const store = require("../store");
const timeOutPromise = (cb, timeout) =>
  new Promise((res, rej) => {
    try {
      setTimeout(async () => {
        res(await cb());
      }, timeout);
    } catch {
      (e) => {
        rej(e);
      };
    }
  });

const clientScene = new CustomWizardScene("clientScene")
  .enter(async (ctx) => {
    const f_name =
      ctx.from?.first_name ?? ctx.from?.username ?? "Дорогой клиент";
    console.log(f_name);
    await ctx
      .replyWithPhoto(ctx.getTitle("GREETING_PHOTO"), {
        caption: ctx.getTitle("GREETING", [f_name]),
      })
      .catch(async (e) => {
        ctx.replyWithTitle("GREETING", [f_name]);
      });
  })
  .addMenu({
    variable: "age",
    options: ["less_35", "3550", "more_50"],
    cb: (ctx) => {
      ctx.wizard.next();
    },
  })
  .addMenu({
    variable: "frequency",
    options: ["never", "rarely", "often"],
    cb: async (ctx) => {
      await ctx
        .replyWithPhoto(ctx.getTitle("STARS_PHOTO"))
        .catch(async (e) => {});
      ctx.wizard.next();
    },
  })
  .addMenu({
    variable: "stars",
    options: ["none", "stars", "knots", "all"],
    cb: (ctx) => {
      ctx.wizard.next();
    },
  })
  .addMenu({
    variable: "heredity",
    options: ["no", "yes"],
    autoNext: false,
    cb: async (ctx) => {
      await ctx.telegram.sendMessage(ctx.chat.id, ctx.getTitle("TEST_ENDED"), {
        reply_markup: { remove_keyboard: true },
      });

      await timeOutPromise(async () => {
        await ctx
          .replyWithPhoto(ctx.getTitle("MEMO_PHOTO"))
          .catch(async (e) => {});
        await ctx.replyWithKeyboard("MEMO", {
          name: "url_keyboard",
          args: [
            {
              SUMMER_RECOMENDATIONS:
                "http://files.dr-flebolog.ru/%D0%9B%D0%B5%D1%82%D0%BD%D0%B8%D0%B5_%D1%80%D0%B5%D0%BA%D0%BE%D0%BC%D0%B5%D0%BD%D0%B4%D0%B0%D1%86%D0%B8%D0%B8_%D1%84%D0%BB%D0%B5%D0%B1%D0%BE%D0%BB%D0%BE%D0%B3%D0%B0.pdf",
            },
          ],
        });
      }, 1000);

      const certificateId = store.createCertificate(ctx.from?.id);

      const f_name =
        ctx.from?.first_name ?? ctx.from?.username ?? "Дорогой клиент";
      const rate = Object.values(ctx.wizard.state.input)?.reduce(
        (prev, el) => (prev += +el[0]),
        0
      );

      if (rate <= 4) {
        await timeOutPromise(async () => {
          await ctx.replyWithTitle("RESULTS_WELL", [f_name]);
        }, 1000);

        await timeOutPromise(async () => {
          await ctx.replyWithKeyboard("WHAT_IS", {
            name: "url_keyboard",
            args: [{ WATCH_WEBINAR: "http://youtu.be/X607VwydagQ" }],
          });
        }, 5000);

        await timeOutPromise(async () => {
          await ctx
            .replyWithPhoto(ctx.getTitle("SERTIFICATE_PHOTO"), {
              caption: ctx.getTitle("SERTIFICATE", [certificateId]),
            })
            .catch(async (e) => {
              await ctx.replyWithTitle("SERTIFICATE", [certificateId]);
            });
        }, 5000);

        await ctx.replyWithKeyboard(
          "SERTIFICATE_ATTENTION",
          {
            name: "url_keyboard",
            args: [
              { CHOOSE_DOCTOR: "http://dr-flebolog.ru/?utm_term=telegrambot" },
            ],
          },
          [certificateId]
        );

        return ctx.wizard.next();
      }

      await timeOutPromise(async () => {
        await ctx.replyWithTitle("RESULTS_BAD", [f_name]);
      }, 1000);

      await timeOutPromise(async () => {
        await ctx
          .replyWithPhoto(ctx.getTitle("SERTIFICATE_PHOTO"))
          .catch(async (e) => {});
        await ctx.replyNextStep();

        await timeOutPromise(async () => {
          if (!ctx.wizard.state.input?.city)
            await ctx.replyWithTitle("ENTER_CITY_AGAIN");
        }, 10000);
      }, 3000);
    },
  })
  .addMenu({
    variable: "city",
    options: [
      "Волгоград",
      "Астрахань",
      "Владикавказ",
      "Нальчик",
      "Ставрополь",
      "Краснодар",
      "Тамбов",
    ],
    autoNext: false,
    cb: async (ctx) => {
      await ctx.telegram.sendMessage(ctx.chat.id, ctx.getTitle("ENTER_PHONE"), {
        reply_markup: { remove_keyboard: true },
      });

      ctx.wizard.next();

      await timeOutPromise(async () => {
        if (!ctx.wizard.state.input?.phone)
          await ctx.replyWithTitle("ENTER_PHONE_AGAIN");
      }, 10000);

      await timeOutPromise(async () => {
        if (!ctx.wizard.state.input?.phone)
          await ctx.replyWithTitle("ENTER_PHONE_AGAIN2");
      }, 10000);

      await timeOutPromise(async () => {
        if (!ctx.wizard.state.input?.phone) {
          const f_name =
            ctx.from?.first_name ?? ctx.from?.username ?? "Дорогой клиент";

          ctx.wizard.state.contacts_changed = true;
          await ctx.replyWithTitle("CONSULT_AGAIN", [f_name]);
        }
      }, 10000);
    },
  })
  .addStep({
    variable: "phone",
    autoNext: false,
    cb: async (ctx) => {
      ctx.wizard.state.input.phone = ctx.message?.text;

      if (
        !/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/.test(
          ctx.wizard.state.input.phone
        )
      )
        return ctx.replyWithTitle("WRONG_PHONE_FORMAT");

      const full_name = ctx.from?.first_name
        ? ctx.from?.last_name
          ? `${ctx.from?.last_name} ${ctx.from?.first_name}`
          : ctx.from?.first_name
        : ctx.from?.username ?? "Не указано";

      if (ctx.wizard.state.contacts_changed) {
        ctx.wizard.next().next();
        return ctx.replyWithKeyboard(
          "CONTACTS_CHANGED",
          {
            name: "custom_bottom_keyboard",
            args: [["CLIENT_SCENE_BUTTON_HELP_C"]],
          },
          [full_name, ctx.wizard.state.input.phone]
        );
      }

      await ctx.replyWithKeyboard("STEPS", {
        name: "url_keyboard",
        args: [
          {
            HOW: "https://www.youtube.com/watch?v=IqdQ0_zUJbU",
            ALL_ABOUT: "http://youtu.be/X607VwydagQ",
          },
        ],
      });

      const certificateId = store.getCertificate(ctx.from?.id);

      await timeOutPromise(async () => {
        await ctx
          .replyWithPhoto(ctx.getTitle("SERTIFICATE_PHOTO"), {
            caption: ctx.getTitle("SERTIFICATE_WITH_CITY", [certificateId]),
          })
          .catch(async (e) => {
            await ctx.replyWithTitle("SERTIFICATE_WITH_CITY", [certificateId]);
          });
      }, 2000);

      const clinic = clinics?.[ctx.wizard.state.input.city];
      const doctors = clinic?.doctors;

      await timeOutPromise(async () => {
        await ctx.replyWithTitle("DOCTORS", [
          ctx.wizard.state.input.city?.toLowerCase(),
          clinic?.address,
        ]);
        //{name: 'url_keyboard', args: [{'CLINIC': 'https://www.youtube.com/watch?v=IqdQ0_zUJbU'}]}
      }, 2000);

      await timeOutPromise(async () => {
        for (doctor of doctors) {
          await ctx
            .replyWithPhoto(doctor.photo, {
              caption: ctx.getTitle("DOCTOR_TOP", [
                doctor.profile,
                doctor.stage,
              ]),
            })
            .catch(async (e) => {
              await ctx.replyWithTitle("DOCTOR_TOP", [
                doctor.profile,
                doctor.stage,
              ]);
            })
            .finally(async () => {
              await ctx.replyWithKeyboard(
                ctx.getTitle("DOCTOR_BOTTOM", [doctor.name, doctor.phone]),
                {
                  name: "url_keyboard",
                  args: [{ DOCTOR_APPOINTMENT: clinic?.link }],
                  //[{'DOCTOR_CHANNEL': clinic?.link, 'DOCTOR_REVIEWS': clinic?.link, 'DOCTOR_APPOINTMENT': clinic?.link}]
                }
              );
            });
        }

        await timeOutPromise(async () => {
          await ctx.wizard.next();
          ctx.replyWithKeyboard(
            "FINAL_TITLE",
            {
              name: "custom_bottom_keyboard",
              args: [["CLIENT_SCENE_BUTTON_HELP"]],
            },
            [certificateId]
          );
        }, 1000);
      }, 1000);
    },
  })
  .addMenu({
    options: ["help"],
    autoNext: false,
    cb: (ctx) => {
      console.log(ctx.wizard.state?.input);
      ctx.replyWithKeyboard(
        ctx.getTitle("HELP_APPOINTMENT", [
          ctx.from?.first_name ?? ctx.from?.username,
          ctx.wizard.state?.input?.phone,
        ]),
        "confirm_keyboard_bottom"
      );
      ctx.wizard.next();
    },
  })
  .addMenu({
    options: ["confirm_help", "help_c"],
    cb: async (ctx) => {
      ctx.replyWithHTML(ctx.getTitle("HELP_SUCCESS"), {
        reply_markup: { remove_keyboard: true },
      });
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        ctx.getTitle("NEW_HELP_APPOINTMENT", [
          ctx.from?.username,
          ctx.from?.first_name ?? ctx.from?.username,
          ctx.wizard.state?.input?.phone,
        ])
      );
    },
  });

module.exports = [clientScene];
