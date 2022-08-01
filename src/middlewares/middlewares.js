const ConfineChecker = require("./confines");

module.exports = {
  deleteMessage(ctx, pm1, pm2, pm3) {
    setTimeout(() => {
      if (ctx.scene.state.pm1) {
        ctx.tg.deleteMessage(ctx.chat.id, ctx.scene.state.pm1);
      }
      ctx.scene.state.pm1 = pm1;
      if (ctx.scene.state.pm2) {
        ctx.tg.deleteMessage(ctx.chat.id, ctx.scene.state.pm2);
      }
      ctx.scene.state.pm2 = pm2;
      if (ctx.scene.state.pm3) {
        ctx.tg.deleteMessage(ctx.chat.id, ctx.scene.state.pm3);
      }
      ctx.scene.state.pm3 = pm3;
    }, 1000);
  },

  initKeyboards(kbName) {
    let kbBottom;

    let kbTop;

    if (kbName === "skip_keyboard" || kbName === "skip_previous_keyboard")
      kbBottom = kbName;

    if (kbName === "coordinates") {
      kbBottom = "choose_c_keyboard";
    } else if (kbName === "tOpportunity") kbBottom = "t_opportunity_keyboard";
    else if (
      kbName === "confirm_keyboard" ||
      kbName === "confirm_add_client_keyboard" ||
      kbName === "confirm_add_contact_comm_keyboard" ||
      kbName === "confirm_cancel_keyboard" ||
      kbName === "enough_keyboard"
    )
      kbTop = kbName;
    else kbBottom = kbName;

    kbTop =
      kbTop ??
      (kbName === "skip_previous_keyboard"
        ? "skip_previous_keyboard"
        : "previous_step_keyboard");

    if (kbName === "coordinates" || kbName === "skip_previous_keyboard")
      kbTop = null;

    return { kbTop, kbBottom };
  },

  passedConfines(ctx, confineNames, stepName) {
    return ConfineChecker.passedConfines(
      ctx?.message?.text,
      confineNames,
      stepName
    );
  },

  async sendInputReply(ctx, header, kbTop, kbBottom, showInputs = false, edit) {
    showInputs = false;
    //console.log(kbTop, kbBottom)
    if (!ctx) throw new Error("no ctx");

    if (!showInputs)
      return edit
        ? (await ctx.editMenu(header, kbBottom))?.message_id
        : header
        ? kbBottom
          ? (await ctx.replyWithKeyboard(header, kbBottom))?.message_id
          : (await ctx.replyWithTitle(header))?.message_id
        : null;

    let paramsString;

    if (ctx.scene?.state?.input)
      paramsString = Object.entries(ctx.scene?.state?.input)
        ?.filter(([name, value]) => {
          return (
            name != "scan" &&
            name != "clientId" &&
            name != "client_id" &&
            name != "photos" &&
            name != "audio" &&
            name != "position" &&
            name != "audios" &&
            name != "documents"
          );
        })
        .map(([name, value]) => {
          if (Array.isArray(value))
            return ctx.getTitle(name) + ": " + ctx.getTitle(value.join(", "));
          return ctx.getTitle(name) + ": " + ctx.getTitle(value);
        })
        .join("\n");

    const scan = ctx.scene.state.input?.scan;

    if (scan) await ctx.replyWithPhoto(scan).catch(console.log);

    const photoLinks = ctx.scene.state.input?.photos;

    if (photoLinks?.length) {
      const photos = photoLinks.map((link) => {
        return {
          media: link,
          type: "photo",
        };
      });
      await ctx.replyWithMediaGroup(photos);
    }

    const pm2 =
      showInputs === true
        ? kbTop
          ? (
              await ctx.replyWithKeyboard(
                ctx.getTitle("ADDING_STATUS", [paramsString]),
                kbTop
              )
            )?.message_id
          : (
              await ctx.replyWithTitle(
                ctx.getTitle("ADDING_STATUS", [paramsString])
              )
            )?.message_id
        : null;

    const pm3 = header
      ? kbBottom
        ? (await ctx.replyWithKeyboard(header, kbBottom))?.message_id
        : (await ctx.replyWithTitle(header))?.message_id
      : null;
    const pm1 = ctx.message?.message_id;

    //if (noNextStep) return

    return { pm1, pm2, pm3 };
  },
};
