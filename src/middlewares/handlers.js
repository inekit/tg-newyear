const {
  Telegraf,
  Composer,
  Scenes: { WizardScene },
} = require("telegraf");
//const addressQuery = require("../Modules/addrByCoordinates")
const {
  passedConfines,
  sendInputReply,
  initKeyboards,
} = require("./middlewares");
//const dialogs = require('./dialogs')
//const updates = require('../Modules/updates')
const middlewares = require("./middlewares");
const query = require("../DB/performQuery");
const actions = require("./actions");

const coordinatesHandler = new Composer(),
  audiosHandler = new Composer(),
  photosHandler = new Composer();
(worksHandler = new Composer()), (pTypeHandler = new Composer());

class FilesHandler extends Composer {
  constructor(confirmCb) {
    super();

    this.on("photo", (ctx) => inputFile(ctx, "photo"));

    //this.on('audio', ctx=>inputFile(ctx, "audio"))

    //this.on('document', ctx=>inputFile(ctx, "document"))

    this.action("confirm", async (ctx) => confirmCb(ctx));
  }
}

class CoordinatesHandler extends Composer {
  constructor(confirmCb) {
    super();

    this.on("location", async (ctx) => await handleLocation(ctx));

    this.action(
      /^(city|address|district|districts|region)$/g,
      async (ctx) => await handleCField(ctx)
    );

    this.on("text", (ctx) => handleCText(ctx));

    this.action("confirm", async (ctx) => confirmCb(ctx));
  }
}

//ptype/works/coordinates

/*async function updateDialogPart(ctx, next, sceneName){

    switch (next){
        case "BUTTON_ADD_ADDRESS": if (await updates.addAlpinist(ctx)) {
            await ctx.replyWithTitle("ALPINIST_HAS_BEEN_REGISTERED");
            return true;
        } else {
            await ctx.replyWithTitle("ALPINIST_HAS_NOT_BEEN_REGISTERED");
            return false;
        }

        case "BUTTON_ADD_CERTIFICATE": {
            const {city, address, region, trip_opportunity, works} = ctx.scene.state.input

            if (await (store.addAlpinistWorkInfo({ city, address, region, trip_opportunity, works, alpinist_id: ctx.from.id}))) {
                await ctx.replyWithTitle("ADDRESS_HAS_BEEN_ADDED");
                return true;
            } else {
                await ctx.replyWithTitle("ADDRESS_HAS_NOT_BEEN_ADDED");
                return false;
            }
        }

        case undefined: {
            if (sceneName === "ordersScene") {
                if (await addOrder(ctx)){
                    //await ctx.replyWithTitle("ORDER_HAS_BEEN_ADDED");
                    return true;
                } else {
                    //await ctx.replyWithTitle("ORDER_HAS_NOT_BEEN_ADDED");
                    return false;
                }
            } else {
                if (await updates.addCertificate(ctx)){
                    await ctx.replyWithTitle("CERTIFICATE_ADDED");
                    return true;
                } else {
                    await ctx.replyWithTitle("CERTIFICATE_NOT_ADDED");
                    return false;
                }
            }
            
        }
        

    }
}*/

audiosHandler.on("audio", (ctx) => inputFile(ctx, "audio"));

//audiosHandler.action('confirm', async ctx => dialogs.confirmDialog(ctx, "ENTER_COORDINATES", "skip_keyboard"))

photosHandler.on("photo", (ctx) => inputFile(ctx, "photo"));

//photosHandler.action('confirm', async ctx => dialogs.confirmDialog(ctx, "ENTER_AUDIO", "skip_keyboard"))

function inputFile(ctx, type) {
  if (!type)
    type = ctx.message?.photo
      ? "photo"
      : ctx.message?.audio
      ? "audio"
      : "document";

  const file_id =
    ctx.message?.[type]?.[0]?.file_id ?? ctx.message?.[type]?.file_id;

  if (!file_id) return ctx.replyWithTitle("TRY_AGAIN");

  if (!ctx.scene?.state?.input) ctx.scene.state.input = {};

  if (!ctx.scene.state.input?.[type + "s"])
    ctx.scene.state.input[type + "s"] = [];

  ctx.wizard.state.input?.[type + "s"].push(file_id);

  //if (ctx.scene.state.sceneName === "ordersScene") store.setOrderDraft(ctx.wizard.cursor, type+"s", ctx.wizard.state.input?.[type+"s"], ctx.from.id)

  const { kbTop, kbBottom } = middlewares.initKeyboards("enough_keyboard");

  middlewares.sendInputReply(ctx, null, kbTop, kbBottom);
}

coordinatesHandler.on("location", async (ctx) => await handleLocation(ctx));

async function handleLocation(ctx) {
  if (ctx.message.location) {
    if (!ctx.wizard.state.input) ctx.wizard.state.input = {};

    let { latitude, longitude } = ctx.message.location;
    const addressInput = 1; //await addressQuery(latitude, longitude);

    Object.assign(ctx.wizard.state.input, addressInput?.[0]);

    if (ctx.scene.state.sceneName === "registerAlpinistScene")
      delete ctx.scene.state.input.coordinates;

    if (ctx.scene.state.sceneName === "registerAlpinistScene")
      return sendInputReply(ctx, null, "choose_city_keyboard", null, true);

    sendInputReply(ctx, null, "choose_c_keyboard", null, true);
    //deleteMessage(ctx,pm1,pm2,pm3)
  }
}

coordinatesHandler.action("confirm", async (ctx) => {
  const input = ctx.wizard.state.input;

  if (ctx.scene.state.sceneName === "orderSettingsScene") {
    const { coordinates, nav_address, city, region, district } =
      ctx.scene.state.input;

    const order_id = ctx.scene.state.order_id;

    //console.log(coordinates, nav_address, city, region, district, order_id);

    /*if(await store.updateAddr(coordinates, nav_address, city, region, district, order_id)) 
            
            await ctx.answerCbQuery(ctx.getTitle("ORDER_HAS_BEEN_UPDATED")).catch(console.log)

        else await ctx.answerCbQuery(ctx.getTitle("ORDER_HAS_NOT_BEEN_UPDATED")).catch(console.log)
*/
    delete ctx.scene.state.input;

    return ctx.scene.enter("orderSettingsScene", {
      edit: true,
      order_id: ctx.scene.state.order_id,
    });
  } else if (ctx.scene.state.sceneName !== "registerAlpinistScene")
    addOrder(ctx);
  else {
    await ctx.answerCbQuery().catch(console.log);

    const { kbTop, kbBottom } = initKeyboards();

    await sendInputReply(ctx, "ENTER_AVG_PRICE", kbTop, kbBottom);

    ctx.wizard.next().next().next();
  }
});

coordinatesHandler.action(
  /^(city|address|district|districts|region)$/g,
  async (ctx) => await handleCField(ctx)
);

async function handleCField(ctx) {
  {
    await ctx.answerCbQuery().catch(console.log);

    ctx.wizard.state.updatingField = ctx.match[1];

    ctx.replyWithTitle("INPUT_" + ctx.match[1]?.toUpperCase());
  }
}

coordinatesHandler.on("text", (ctx) => handleCText(ctx));

function handleCText(ctx) {
  {
    if (!ctx.wizard.state.updatingField) return;

    if (!passedConfines(ctx, [], ctx.wizard.state.updatingField))
      return ctx.replyWithTitle("TRY_AGAIN");

    ctx.wizard.state.input[ctx.wizard.state.updatingField] = ctx.message?.text;

    delete ctx.wizard.state.updatingField;

    if (ctx.scene.state.sceneName === "registerAlpinistScene")
      return sendInputReply(ctx, null, "choose_city_keyboard", null, true);

    sendInputReply(ctx, null, "choose_c_keyboard", null, true);
  }
}

worksHandler.action(/^work\-(.+)$/g, async (ctx) => {
  await ctx.answerCbQuery().catch(console.log);

  if (!ctx.scene.state.input) ctx.scene.state.input = {};

  if (
    !ctx.scene.state.input?.works ||
    !Array.isArray(ctx.scene.state.input?.works)
  )
    ctx.scene.state.input.works = [];

  console.log(ctx.scene.state.input.works);
  /*
    if (!ctx.scene.state.input.works.includes(store.works[ctx.match[1]])) 
        ctx.scene.state.input.works.push(store.works[ctx.match[1]]);

    if (ctx.scene.state.sceneName === "ordersScene") store.setOrderDraft(ctx.wizard.cursor, 'works', ctx.scene.state.input.works, ctx.from.id)
*/

  const { kbTop, kbBottom } = middlewares.initKeyboards("work");

  console.log("kb", kbBottom, kbTop);

  const { pm1, pm2, pm3 } = await middlewares.sendInputReply(
    ctx,
    "ENTER_WORKS",
    kbTop,
    kbBottom
  );
});

worksHandler.action("confirm", async (ctx) => {
  if (ctx.scene.state.sceneName === "orderSettingsScene") {
    const { works } = ctx.scene.state.input;

    const order_id = ctx.scene.state.order_id;

    if (1 /*await store.updateWorks(works, order_id)*/)
      await ctx
        .answerCbQuery(ctx.getTitle("ORDER_HAS_BEEN_UPDATED"))
        .catch(console.log);
    else
      await ctx
        .answerCbQuery(ctx.getTitle("ORDER_HAS_NOT_BEEN_UPDATED"))
        .catch(console.log);

    delete ctx.scene.state.input.works;

    return ctx.scene.enter("orderSettingsScene", {
      edit: true,
      order_id: ctx.scene.state.order_id,
    });
  } else if (ctx.scene.state.sceneName === "alpinistProfileScene") {
    const { works } = ctx.scene.state.input;

    if (1 /*await store.updateProfileWorks(works, ctx.from.id)*/)
      await ctx
        .answerCbQuery(ctx.getTitle("WORKS_HAS_BEEN_UPDATED"))
        .catch(console.log);
    else
      await ctx
        .answerCbQuery(ctx.getTitle("WORKS_HAS_NOT_BEEN_UPDATED"))
        .catch(console.log);

    delete ctx.scene.state.input.works;

    return ctx.scene.enter("alpinistProfileScene", { edit: true });
  }

  await ctx.answerCbQuery().catch(console.log);

  //dialogs.confirmDialog(ctx, "ENTER_FILES", 'skip_keyboard')
});

pTypeHandler.action(/^pay\_(agent|alpinist)$/, async (ctx) => {
  console.log(ctx);

  if (ctx.scene.state.sceneName === "orderSettingsScene") {
    const order_id = ctx.scene.state.order_id;
    if (
      (
        await query("UPDATE_PTYPE", ctx.match[1], order_id, ctx.from?.id).catch(
          console.log
        )
      )?.affectedRows
    )
      await ctx
        .answerCbQuery(ctx.getTitle("ORDER_HAS_BEEN_UPDATED"))
        .catch(console.log);
    else
      await ctx
        .answerCbQuery(ctx.getTitle("ORDER_HAS_NOT_BEEN_UPDATED"))
        .catch(console.log);

    return ctx.scene.enter("orderSettingsScene", {
      edit: true,
      order_id: ctx.scene.state.order_id,
    });
  }

  await ctx.answerCbQuery().catch(console.log);

  ctx.scene.state.input.payment_type = ctx.match[1];

  //if (ctx.scene.state.sceneName === "ordersScene") store.setOrderDraft(ctx.wizard.cursor, 'payment_type', ctx.scene.state.input.payment_type, ctx.from.id)

  const { keyboard, header } = { keyboard: "work", header: "ENTER_WORKS" }; //ctx.steps.nextStepData(ctx.wizard.cursor)

  const { kbTop, kbBottom } = middlewares.initKeyboards(keyboard);

  if (kbBottom) ctx.replyWithKeyboard(header, kbBottom);
  else ctx.replyWithTitle(header);

  ctx.wizard.next();
});

async function addOrder(ctx) {
  const order_id = 1; //await store.addOrder(ctx.wizard.state.input);

  ctx.scene.state.order_id = order_id;

  if (order_id) {
    //store.removeOrderDraft(ctx.from.id)

    return ctx.replyWithKeyboard(
      "ORDER_HAS_BEEN_ADDED",
      "send_to_alp_keyboard"
    );
  }
  await ctx.replyWithTitle("ORDER_HAS_NOT_BEEN_ADDED");

  ctx.scene.enter("ordersScene");
}

module.exports = {
  coordinatesHandler,
  audiosHandler,
  photosHandler,
  FilesHandler,
  createH,
  pTypeHandler,
  worksHandler,
  CoordinatesHandler,
};
