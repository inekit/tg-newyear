const createKeyboard = require("../middlewares/createKeyboard");
const titles = require("../middlewares/titles");
//const store = require('../LocalStorage/store')
const handleRestriction = (e) => console.log(e);
//const query = require('../DB/performQuery')

module.exports = {
  botName: async function () {
    return (await this.telegram.getMe()).username;
  },

  sceneName: function () {
    console.log(ctx, this.scene, this.scene?.options);
    return this.scene?.options?.defaultSession?.current;
  },

  setLocale: async function (language) {
    this.session.language = language;

    //query("SET_LANGUAGE", language, this.from.id)
  },

  setAdminLocale: function (language) {
    this.session.admin_locale = "ru";
  },

  switchAdminLocale: function () {
    this.session?.admin_locale === "en"
      ? (this.session.admin_locale = "ru")
      : (this.session.admin_locale = "en");

    this.replyWithTitle("ADMIN_LOCALE_CHANGED", [this.session.admin_locale]);
  },

  setTitle: function (title, value, language) {
    return titles.setTitle(title, value);
  },

  getTitle: function (title, options, markup) {
    return titles.getTitle(
      title,
      this.session?.language || "ru",
      options,
      markup
    );
  },

  replyWithTitle: function (title, options, markup) {
    return markup === "md2"
      ? this.replyWithMarkdownV2(this.getTitle(title, options, markup), {
          disable_web_page_preview: true,
        }).catch(handleRestriction)
      : this.replyWithHTML(this.getTitle(title, options), {
          disable_web_page_preview: true,
        }).catch(handleRestriction);
  },

  replyWithKeyboard: async function (title, keyboard, options, markup) {
    const extra = createKeyboard(keyboard, this);
    extra.disable_web_page_preview = true;

    const response =
      markup === "md2"
        ? await this.replyWithMarkdownV2(
            this.getTitle(title, options, markup),
            extra
          ).catch(handleRestriction)
        : await this.replyWithHTML(this.getTitle(title, options), extra).catch(
            handleRestriction
          );

    if (this.session) this.session.last_keyboard = response?.message_id;

    return response;
  },

  sendWithKeyboard: async function (chat_id, title, keyboard, options) {
    const extra = Object.assign(createKeyboard(keyboard, this), {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    extra.disable_web_page_preview = true;

    const response = await this.telegram
      .sendMessage(chat_id, this.getTitle(title, options), extra)
      .catch(handleRestriction);

    if (this.session) this.session.last_keyboard = response?.message_id;

    return response;
  },

  getCopy: function (section, language) {
    language = language ?? this.session.language ?? "ru";

    let message;

    if (section) message = store.get(`messages.${language}.${section}`);

    return message;
  },

  replyWithCopy: async function (keyboard, section, language) {
    let chat_id, message_id;

    language = language ?? this.session.language ?? "ru";

    if (section) {
      const message = store.get(`messages.${language}.${section}`);

      //console.log(`messages.${language}`)

      if (message) {
        chat_id = message.chat_id;
        message_id = message.message_id;
      } else {
        return this.replyWithTitle("NO_MESSAGE_YET");
      }
    } else {
      chat_id = this.from.id;
      message_id = this.message.message_id;
    }

    if (!keyboard)
      return this.telegram
        .copyMessage(this.from.id, chat_id, message_id)
        .catch((e) => {});

    const extra = createKeyboard(keyboard, this);

    try {
      const response = await this.telegram.copyMessage(
        this.from.id,
        chat_id,
        message_id,
        extra
      );

      this.session.last_keyboard = response?.message_id;
    } catch (error) {
      return;
    }
  },

  editKeyboard: async function (keyboard) {
    const { reply_markup } = await createKeyboard(keyboard, this);

    return this.editMessageReplyMarkup(reply_markup).catch((e) => {});
  },

  editMenu: async function (title, keyboard, options, markup) {
    const extra = {
      parse_mode: markup === "md2" ? "MarkdownV2" : "HTML",
      disable_web_page_preview: true,
    };

    keyboard && Object.assign(extra, await createKeyboard(keyboard, this));

    return this.editMessageText(
      this.getTitle(title, options, markup),
      extra
    ).catch((e) => {
      //console.log(e);
    });
  },

  sendCopyOpt: async function (from, message_id, keyboard) {
    if (keyboard) {
      const extra = createKeyboard(keyboard, this);

      if (this.session) {
        const response = await this.telegram.copyMessage(
          this.chat.id,
          from,
          message_id,
          extra
        );

        this.session.last_keyboard = response?.message_id;

        return;
      }

      return this.telegram.copyMessage(this.chat.id, from, message_id, extra);
    }

    return this.telegram.copyMessage(this.chat.id, from, message_id, {
      disable_web_page_preview: true,
    });
  },

  getTitleOpt: function (title, language, options) {
    return titles.getTitle(title, language, options);
  },

  sendTitleOpt: async function (id, title, language, options) {
    const opt_lang = ""; //language || (await query("GET_LANGUAGE", id))?.[0]?.language || 'ru'

    return this.telegram
      .sendMessage(id, this.getTitleOpt(title, opt_lang, options), {
        parse_mode: "HTML",
      })
      .catch((e) => {});
  },

  sendKeyboardOpt: function (id, title, keyboard, language, options) {
    const opt_lang = language || "ru";

    const extra = createKeyboard(keyboard, this);
    extra.parse_mode = "HTML";

    return this.telegram
      .sendMessage(id, this.getTitleOpt(title, opt_lang, options), extra)
      .catch((e) => {});
  },

  editLastMenu: async function (title, keyboard, options) {
    const extra = { parse_mode: "HTML", disable_web_page_preview: true };

    if (keyboard) Object.assign(extra, await createKeyboard(keyboard, this));

    return this.telegram
      .editMessageText(
        this.chat.id,
        this.session.last_keyboard,
        undefined,
        this.getTitle(title, options),
        extra
      )
      .catch((e) => {});
  },

  editKeyboardOpt: async function (chat_id, message_id, keyboard) {
    const { reply_markup } = await createKeyboard(keyboard, this);

    return this.telegram.editMessageReplyMarkup(
      chat_id,
      message_id,
      undefined,
      reply_markup
    );
  },
};
