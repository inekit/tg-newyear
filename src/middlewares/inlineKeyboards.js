const { Markup } = require("telegraf");

const callbackButton = Markup.button.callback;
const urlButton = Markup.button.url;
const { inlineKeyboard } = Markup;

exports.profile_keyboard = (ctx, id) => {
  return inlineKeyboard([
    callbackButton(ctx.getTitle("REFERAL_BUTTON"), "referal_menu"),
  ]);
};

exports.referal_keyboard = (ctx, id) => {
  return inlineKeyboard([
    callbackButton(ctx.getTitle("MY_REFERALS_BUTTON"), "my_referals_menu"),
    callbackButton(ctx.getTitle("BACK_BUTTON"), "back_to_profile"),
  ]);
};

exports.my_referals_keyboard = (ctx, id) => {
  return inlineKeyboard([
    callbackButton(ctx.getTitle("BACK_BUTTON"), "back_to_referal"),
  ]);
};

exports.support_keyboard = (ctx) => {
  return inlineKeyboard([
    [
      callbackButton("1", "support_1"),
      callbackButton("2", "support_2"),
      callbackButton("3", "support_3"),
    ],
    [
      callbackButton("4", "support_4"),
      callbackButton("5", "support_5"),
      callbackButton("6", "support_6"),
    ],
    [
      callbackButton("7", "support_7"),
      //callbackButton(ctx.getTitle("CONNECT_BUTTON"), "connect_support"),
      urlButton(ctx.getTitle("CONNECT_BUTTON"), "t.me/mafioznuk_0_0"),
    ],
  ]);
};

exports.current_support_keyboard = (ctx) => {
  return inlineKeyboard([
    [
      urlButton(ctx.getTitle("CONNECT_BUTTON"), "t.me/mafioznuk_0_0"),
      callbackButton(ctx.getTitle("BACK_BUTTON"), "back_to_support"),
    ],
  ]);
};

exports.pay_qiwi_keyboard = (ctx, link) => {
  return inlineKeyboard([[urlButton(ctx.getTitle("PAY_BUTTON"), link)]]);
};

exports.payment_type_keyboard = (ctx) => {
  return inlineKeyboard([
    [callbackButton("🥝QIWI", "qiwi")],
    [callbackButton("🟢Сбербанк", "sber")],
    [callbackButton("🔆Тинькофф", "tinkoff")],
  ]);
};

exports.no_money_keyboard = (ctx) => {
  return inlineKeyboard([
    [callbackButton(ctx.getTitle("GET_MONEY"), "get_money")],
  ]);
};

exports.ads_list_keyboard = (ctx, ads) => {
  const keyboard = inlineKeyboard(
    ads.map(({ add_id, header }) => callbackButton(header, "add-" + add_id)),
    { columns: 2 }
  );

  keyboard.reply_markup.inline_keyboard.push([
    callbackButton(ctx.getTitle("BUTTON_ADD_ADD"), "addAdd"),
  ]);

  return keyboard;
};

exports.wa_keyboard = (ctx, id) => {
  const keyboard = inlineKeyboard(
    [callbackButton(ctx.getTitle("APROOVE_BUTTON"), "aproove-" + id)],
    { columns: 1 }
  );

  return keyboard;
};

exports.ga_keyboard = (ctx, id) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("APROOVE_BUTTON"), "aproove-" + id),
      callbackButton(ctx.getTitle("REJECT_BUTTON"), "reject-" + id),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.update_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [callbackButton(ctx.getTitle("UPDATE_BUTTON"), "reload")],
    { columns: 1 }
  );

  return keyboard;
};

exports.new_appointment_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [callbackButton(ctx.getTitle("MAKE_ORDER_BUTTON"), "new_appointment")],
    { columns: 1 }
  );
  return keyboard;
};

exports.appointsments_keyboard = (ctx, app) => {
  let k = inlineKeyboard([]);

  app.forEach(({ id, description }) => {
    k.reply_markup.inline_keyboard.push([
      callbackButton(description, "appointsment_" + id),
    ]);
  });

  return k;
};

exports.register_lawyer_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [callbackButton(ctx.getTitle("BUTTON_REGISTER_LAWYER"), "register")],
    { columns: 1 }
  );

  return keyboard;
};

exports.check_enter_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("REENTER"), "re_enter"),
      callbackButton(ctx.getTitle("NEXT"), "next"),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.i_paid_keyboard = (ctx, id) => {
  return inlineKeyboard([
    callbackButton(ctx.getTitle("I_PAID"), "i_paid_" + id),
  ]);
};

exports.appointment_finish_kb = (ctx, id) => {
  return inlineKeyboard([
    callbackButton(ctx.getTitle("FINISH"), "finish_" + id),
  ]);
};

exports.pay_link_kb = (ctx, link) => {
  return inlineKeyboard([
    [urlButton("Оплатить", link)],
    [callbackButton(ctx.getTitle("I_PAID_A"), "i_paid_a")],
  ]);
};

exports.appointment_cancel_kb = (ctx, id) => {
  return inlineKeyboard([
    callbackButton(ctx.getTitle("CANCEL"), "cancel_" + id),
  ]);
};

exports.drop_get_ap_keyboard_main = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("DROP_APPOINTMENT"), "drop_appointment_main"),
      callbackButton(ctx.getTitle("CHOOSE_WORKER"), "choose_worker_main"),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.drop_get_ap_keyboard = (ctx, id) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(
        ctx.getTitle("DROP_APPOINTMENT"),
        "drop_appointment_" + id
      ),
      callbackButton(ctx.getTitle("CHOOSE_WORKER"), "choose_worker_" + id),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.main_menu_keyboard = (ctx) => {
  const buttons = [
    callbackButton(ctx.getTitle("CLIENT_SCENE"), "enter_client"),
    callbackButton(ctx.getTitle("LAWYER_SCENE"), "enter_lawyer"),
    callbackButton(ctx.getTitle("ADMIN_SCENE"), "enter_admin"),
  ];

  if (isAdmin) buttons.push([ctx.getTitle("ADMIN_SCENE_BUTTON")]);

  return Markup.keyboard(buttons).resize();
};

exports.admin_main_keyboard_owner = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("APPOINTMENTS"), "appointments"),
      callbackButton(ctx.getTitle("LAWYERS"), "lawyers"),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.i_gets = (ctx, id) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(
        ctx.getTitle("I_GET_APPOINTMENT"),
        "get_appointment_" + id
      ),
    ],
    { columns: 1 }
  );

  return keyboard;
};

exports.choose_worker_keyboard = (ctx, workers) => {
  let k = inlineKeyboard([]);

  console.log(workers);

  workers.forEach(({ fio, id, rate, city }) => {
    console.log(id, fio, rate);
    k.reply_markup.inline_keyboard.push([
      callbackButton(
        `${fio ?? "Аноним"} ${rate ?? "без оцен."}`,
        "worker_" + id
      ),
    ]);
  });

  return k;
};

exports.drop_verify_keyboard = (ctx, id) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("DROP_LAWYER"), "skip_" + id),
      callbackButton(ctx.getTitle("VERIFY_LAWYER"), "verify_" + id),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.orders_reviews_keyboard = (ctx, orders) => {
  let k = inlineKeyboard([]);

  orders.forEach(({ description, id, worker_id }) => {
    k.reply_markup.inline_keyboard.push([
      callbackButton(
        description ?? "  ",
        worker_id ? "order_" + id : "appointment_" + id
      ),
    ]);
  });

  return k;
};

exports.rate_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton("1", "rate_1"),
      callbackButton("2", "rate_2"),
      callbackButton("3", "rate_3"),
      callbackButton("4", "rate_4"),
      callbackButton("5", "rate_5"),
    ],
    { columns: 1 }
  );

  return keyboard;
};

exports.admins_actions_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_ADD_ADMIN"), "addAdmin"),
      callbackButton(ctx.getTitle("BUTTON_DELETE_ADMIN"), "deleteAdmin"),
    ],
    { columns: 2 }
  );

  return keyboard;
};

exports.captcha_actions_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_SEND_CAPTCHA"), "send_captcha"),
      callbackButton(ctx.getTitle("BUTTON_CANCEL_CAPTCHA"), "cancel_captcha"),
    ],
    { columns: 1 }
  );

  return keyboard;
};

exports.change_text_actions_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_CHANGE_GREETING"), "change_greeting"),
      callbackButton(ctx.getTitle("BUTTON_CHANGE_HELP"), "change_help"),
      callbackButton(ctx.getTitle("BUTTON_CHANGE_CARD"), "change_card"),
      callbackButton(ctx.getTitle("BUTTON_CHANGE_PHOTO"), "change_photo"),
    ],
    { columns: 1 }
  );

  return keyboard;
};

exports.admins_list_keyboard = (ctx, admins) => {
  const keyboard = inlineKeyboard(
    admins.map(({ userId }) => callbackButton(userId, "admin-" + userId)),
    { columns: 2 }
  );

  return keyboard;
};

exports.add_delete_keyboard = (ctx) => {
  const keyboard = inlineKeyboard(
    [callbackButton("ADD", "add"), callbackButton("DELETE", "delete")],
    { columns: 2 }
  );

  return keyboard;
};

exports.custom_keyboard = (ctx, bNames, bLinks) => {
  let k = inlineKeyboard([]);

  if (bNames.length != bLinks.length) return k;

  bNames.forEach((name, id) => {
    k.reply_markup.inline_keyboard.push([
      callbackButton(ctx.getTitle(name), bLinks[id]),
    ]);
  });

  return k;
};

exports.custom_obj_keyboard = (ctx, bNamesObj) => {
  let k = inlineKeyboard([], { columns: 3 }).resize();

  Object.entries(bNamesObj)?.forEach(([name, link], i) => {
    // console.log(name, link)
    if (i % 2 === 0)
      k.reply_markup.inline_keyboard.push([
        callbackButton(ctx.getTitle(name), link),
      ]);
    else
      k.reply_markup.inline_keyboard[
        k.reply_markup.inline_keyboard.length - 1
      ].push(callbackButton(ctx.getTitle(name), link));
  });

  return k.resize();
};

exports.dictionary_keyboard = (dictionary, tag) => {
  let k = inlineKeyboard([], { columns: 2 });

  dictionary.forEach((type_name, id) => {
    k.reply_markup.inline_keyboard.push([
      callbackButton(type_name, `${tag}-${id}`),
    ]);
  });

  return k;
};

exports.skip_keyboard = (ctx) => this.custom_keyboard(ctx, ["SKIP"], ["skip"]);

exports.greetings_keyboard = (ctx) =>
  this.custom_keyboard(ctx, ["IUNDERSTOOD"], ["confirm"]);

exports.greetings_fin_keyboard = (ctx) =>
  this.custom_keyboard(ctx, ["FIN"], ["fin"]);

exports.skip_previous_keyboard = (ctx) =>
  inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_PREVIOUS"), "previous_step"),
      callbackButton(ctx.getTitle("BUTTON_SKIP"), "skip"),
    ],
    { columns: 2 }
  );

exports.confirm_cancel_keyboard = (ctx) =>
  inlineKeyboard(
    [
      callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "confirm"),
      callbackButton(ctx.getTitle("BUTTON_CANCEL"), "cancel"),
    ],
    { columns: 1 }
  );

exports.go_back_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_GO_BACK"), "go_back")]);

exports.skip_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_SKIP"), "skip")]);

exports.cancel_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_CANCEL"), "cancel")]);

exports.confirm_keyboard = (ctx) =>
  inlineKeyboard([callbackButton(ctx.getTitle("BUTTON_CONFIRM"), "confirm")]);
