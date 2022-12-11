const { Markup } = require("telegraf");

exports.custom_bottom_keyboard = (ctx, bNames, columns = 2) => {
  let k = Markup.keyboard([], { columns: 2 }).resize();

  bNames = bNames.reduce((prev, cur, i) => {
    if (i % columns === 0) {
      prev.push([ctx.getTitle(cur)]);
      return prev;
    } else {
      prev[prev.length - 1].push(ctx.getTitle(cur));
      return prev;
    }
  }, []);

  bNames.forEach((name) => {
    k.reply_markup.keyboard.push(name);
  });

  return k;
};

exports.custom_botkeyboard = (ctx, registered) => {
  const buttons = [
    [ctx.getTitle("BUTTON_ORDERS"), ctx.getTitle("BUTTON_CLIENTS")],
    [ctx.getTitle("BUTTON_AGENT_PROFILE")],
    [ctx.getTitle("BUTTON_CHOOSE_ROLE")],
  ];

  return Markup.keyboard(buttons).resize();
};

exports.main_menu_admin_keyboard = (ctx) => {
  const buttons = [[ctx.getTitle("ADMIN_SCENE_BUTTON")]];

  return Markup.keyboard(buttons).resize();
};

exports.main_keyboard = (ctx, isAdmin) => {
  const buttons = [
    ctx.getTitle("TASKS_BUTTON"),
    ctx.getTitle("INTERNAL_TASKS_BUTTON"),
    ctx.getTitle("PROFILE_BUTTON"),
    ctx.getTitle("HELP_BUTTON"),
    ctx.getTitle("REFERALS_BUTTON"),
    ctx.getTitle("REPORT_BUTTON"),
    ctx.getTitle("WITHDRAWAL_BUTTON"),
  ];

  if (isAdmin) buttons.push(ctx.getTitle("BUTTON_BACK_ADMIN"));

  return Markup.keyboard(buttons, { columns: 3 }).resize();
};

exports.admin_keyboard = (ctx) =>
  Markup.keyboard([
    [ctx.getTitle("BUTTON_ADD")],
    [ctx.getTitle("BUTTON_WA"), ctx.getTitle("BUTTON_WA_WAIT")],
    [ctx.getTitle("BUTTON_ANSWERS"), ctx.getTitle("BUTTON_REPORTS")],
    [ctx.getTitle("BUTTON_BALANCE"), ctx.getTitle("BUTTON_CATALOG")],
    [ctx.getTitle("BUTTON_ADMINS"), ctx.getTitle("BUTTON_CHANGE_TEXT")],
    [ctx.getTitle("BUTTON_CLIENT_MENU")],
  ]).resize();

exports.categories_list_keyboard_bottom = (ctx, data) => {
  const categoryButtons = data?.map((name) => {
    return [name];
  });

  //categoryButtons?.push([totalStr]);

  return Markup.keyboard(categoryButtons).resize();
};

/*exports.admin_main_keyboard = (ctx) =>
  Markup.keyboard([
    [ctx.getTitle("BUTTON_ADD")],
    [ctx.getTitle("BUTTON_CAPTCHA")],
    [ctx.getTitle("BUTTON_CLIENT_MENU")],
  ]).resize();

exports.admin_main_keyboard_owner = (ctx) =>
  Markup.keyboard([
    [ctx.getTitle("BUTTON_ADD")],
    [ctx.getTitle("BUTTON_CAPTCHA")],
    [ctx.getTitle("BUTTON_ADMINS")],
    [ctx.getTitle("BUTTON_CLIENT_MENU")],
  ]).resize();*/

exports.main_menu_goback_tasks_keyboard = (ctx) =>
  Markup.keyboard(
    [ctx.getTitle("BUTTON_GO_BACK_TASKS"), ctx.getTitle("BUTTON_BACK_USER")],
    { columns: 1 }
  ).resize();

exports.main_menu_back_keyboard = (ctx) =>
  Markup.keyboard([ctx.getTitle("BUTTON_BACK_USER")]).resize();

exports.alpinist_back_keyboard = (ctx) =>
  Markup.keyboard([ctx.getTitle("BUTTON_BACK_ALPINIST")]).resize();

exports.admin_back_keyboard = (ctx) =>
  Markup.keyboard([ctx.getTitle("BUTTON_BACK_ADMIN")]).resize();

exports.remove_keyboard = () => Markup.removeKeyboard();
