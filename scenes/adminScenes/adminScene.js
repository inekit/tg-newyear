const {
  Composer,
  Scenes: { BaseScene },
} = require("telegraf");

const {
  titles,
  handlers: { FilesHandler },
} = require("telegraf-steps-engine");
const scene = new BaseScene("adminScene");
const main_menu_button = "admin_back_keyboard";

scene.enter(async (ctx) => {
  if (!ctx.session.registered) {
    const [{ exists }] = [{ true: 1 }]; //await query('IS_USER_EXISTS', ctx.from.id)

    if (!exists) {
      //return ctx.replyWithKeyboard('CHOOSE_LANGUAGE', 'select_language_keyboard')
    }
  }

  return ctx.replyWithKeyboard("CHOOSE_ACTION", "admin_keyboard");
});

scene.hears(titles.getValues("BUTTON_REGISTER_ADMIN"), async (ctx) => {
  const agent_id = 1; //await store.addAdmin(ctx.from.id);

  if (agent_id) ctx.replyWithTitle("AGENT_ADDED");
  else ctx.replyWithTitle("AGENT_NOT_ADDED");
});

scene.hears(titles.getValues("BUTTON_ADD"), (ctx) =>
  ctx.scene.enter("adsLinkScene", { main_menu_button })
);

scene.hears(titles.getValues("BUTTON_ADMINS"), (ctx) =>
  ctx.scene.enter("adminsScene", { main_menu_button })
);

scene.hears(titles.getValues("BUTTON_WA"), (ctx) =>
  ctx.scene.enter("waScene", { main_menu_button, waiting: false })
);

scene.hears(titles.getValues("BUTTON_WA_WAIT"), (ctx) =>
  ctx.scene.enter("waScene", { main_menu_button, waiting: true })
);

scene.hears(titles.getValues("BUTTON_GA"), (ctx) =>
  ctx.scene.enter("gaScene", { main_menu_button })
);

scene.hears(titles.getValues("BUTTON_GA"), (ctx) =>
  ctx.scene.enter("gaScene", { main_menu_button })
);

scene.hears(titles.getValues("BUTTON_COURSE"), (ctx) =>
  ctx.scene.enter("changeCourse", { main_menu_button })
);

module.exports = scene;
