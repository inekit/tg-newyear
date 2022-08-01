const { CustomWizardScene, titles } = require("telegraf-steps-engine");
const CustomContextWizard = require("telegraf-steps-engine/context");
const dateFormats = ["D.MMMM.YYYY", "DD.MM.YY", "DD.MM.YYYY", "DD.MM.YYYY"];
const getCurrencies = require("../Utils/getCources");
const moment = require("moment");

const clientScene = new CustomWizardScene("clientScene")
  .enter(async (ctx) => {
    const { USD, EUR, KRW } = (ctx.scene.state.currencies =
      await getCurrencies());

    delete ctx.wizard.state.input;

    ctx.replyWithTitle("START_TITLE", [KRW, USD, EUR]);
  })
  .addStep({
    variable: "price",
    cb: async (ctx) => {
      if (parseInt(ctx.message.text) != ctx.message.text)
        return ctx.replyWithTitle("ENTER_TEXT_PRICE");
      if (parseInt(ctx.message.text) < 5000000)
        await ctx.replyWithTitle("TOO_LOW_PRICE", [
          (
            parseInt(ctx.message.text) /
            parseFloat(ctx.scene.state.currencies.KRW)
          )
            .toFixed(3)
            .replace(".", ","),
        ]);

      !ctx.wizard.state.input
        ? (ctx.wizard.state.input = { price: ctx.message.text })
        : (ctx.wizard.state.input.price = ctx.message.text);

      if (ctx.wizard.state.input.volume && ctx.wizard.state.input.age)
        return sendSum(ctx);
      if (ctx.wizard.state.input.volume) return ctx.replyStep(2);
      ctx.replyNextStep();
    },
  })
  .addSelect({
    variable: "volume",
    options: {
      "1000 см3": "1000",
      "1200 см3": "1200",
      "1500 см3": "1500",
      "1600 см3": "1600",
      "2000 см3": "2000",
      "2200 см3": "2200",
      "2500 см3": "2500",
      "3000 см3": "3000",
      "3300 см3": "3300",
      "3500 см3": "3500",
      "3800 см3": "3800",
      Электромобиль: "0",
    },
    cb: (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      ctx.wizard.state.input.volume = ctx.match[0];

      if (ctx.wizard.state.input.age) return sendSum(ctx);

      ctx.replyNextStep();
    },
  })
  .addSelect({
    variable: "age",
    options: {
      "Младше 3 лет": "0",
      "От 3 до 5 лет": "3",
      "Старше 5 лет": "6",
    },
    onInput: (ctx) => {
      const now = moment();
      const date = moment(ctx.message.text, dateFormats, true);

      if (date >= now || !date.isValid())
        return ctx.replyWithTitle("ENTER_VALID_DATE");

      ctx.wizard.state.input.date_register = date.toString();

      sendSum(ctx);
    },
    cb: (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      ctx.wizard.state.input.age = ctx.match[0];
      sendSum(ctx);
    },
  })
  .addStep({
    variable: "usd",
    cb: (ctx) => {
      if (parseFloat(ctx.message.text) != ctx.message.text) return;

      ctx.scene.state.currencies.USD = ctx.message.text;
      if (ctx.wizard.state.input.volume && ctx.wizard.state.input.age)
        return sendSum(ctx);
      if (ctx.wizard.state.input.volume) return ctx.replyStep(2);
      ctx.replyNextStep();
    },
  })
  .addStep({
    variable: "eur",
    cb: (ctx) => {
      if (parseFloat(ctx.message.text) != ctx.message.text) return;

      ctx.scene.state.currencies.EUR = ctx.message.text;
      if (ctx.wizard.state.input.volume && ctx.wizard.state.input.age)
        return sendSum(ctx);
      if (ctx.wizard.state.input.volume) return ctx.replyStep(2);
      ctx.replyNextStep();
    },
  })
  .addStep({
    variable: "krw",
    cb: (ctx) => {
      if (parseFloat(ctx.message.text) != ctx.message.text) return;

      ctx.scene.state.currencies.KRW = ctx.message.text;
      if (ctx.wizard.state.input.volume && ctx.wizard.state.input.age)
        return sendSum(ctx);
      if (ctx.wizard.state.input.volume) return ctx.replyStep(2);
      ctx.replyNextStep();
    },
  });

function sendSum(ctx) {
  const { USD, EUR, KRW } = ctx.scene.state.currencies;

  let { price, volume, age, date_register } = ctx.wizard.state.input;

  price = parseInt(price);

  volume = parseInt(volume);

  console.log(ctx.wizard.state.input, price, parseFloat(KRW));

  const rubPrice = (parseInt(price) / parseFloat(KRW))
    .toFixed(3)
    .replace(".", ",");

  const usdPrice = (parseFloat(rubPrice) / parseFloat(USD))
    .toFixed(3)
    .replace(".", ",");

  const eurPrice = parseFloat(rubPrice) / parseFloat(EUR);

  if (date_register) {
    const date = moment(ctx.message.text, dateFormats, true);
    const now = moment();
    age = now.diff(date, "year");
    console.log(age);
    age = age < 3 ? "0" : age.toString();
  }

  const utilSbor = age !== "0" ? 5300 : 3400;

  let tax;

  if (age === "0") {
    console.log(eurPrice);
    const perc = eurPrice > 8499 ? 0.48 : 0.54;
    const prices = {
      8500: 2.5,
      16700: 3.5,
      42300: 5.5,
      84500: 7.5,
      169000: 15,
      500000000: 20,
    };

    let volPrice;
    Object.entries(prices)
      .reverse()
      .forEach(([maxSum, price]) => {
        if (eurPrice <= maxSum) volPrice = price * parseInt(volume);
      });

    console.log(perc * eurPrice, volPrice);

    tax = Math.max(perc * eurPrice, volPrice);
  } else if (parseInt(age) <= 5) {
    const prices = {
      1000: 1.5,
      1500: 1.7,
      1800: 2.5,
      2300: 2.7,
      3000: 3,
      300000: 3.6,
    };

    Object.entries(prices)
      .reverse()
      .forEach(([maxVolume, price]) => {
        if (parseInt(volume) <= maxVolume) tax = price * parseInt(volume);
      });
  } else {
    const prices = {
      1000: 3,
      1500: 3.2,
      1800: 3.5,
      2300: 4.8,
      3000: 5,
      300000: 5.7,
    };

    Object.entries(prices)
      .reverse()
      .forEach(([maxVolume, price]) => {
        if (parseInt(volume) <= maxVolume) tax = price * parseInt(volume);
      });
  }

  const invoiceSum = (
    parseInt(parseInt(usdPrice).toFixed(0)) +
    parseFloat(USD) +
    parseFloat(USD) +
    parseFloat(USD)
  ).toFixed(0);

  const taxRub = Math.round(tax * parseFloat(EUR) * 1000) / 1000;

  const sum =
    parseInt(parseInt(rubPrice).toFixed(0)) +
    taxRub +
    775 +
    utilSbor +
    300 * parseFloat(USD) +
    250 * parseFloat(USD) +
    4000 +
    3000 +
    20000 +
    1270 * parseFloat(USD) +
    150000;

  ctx.replyWithTitle("SUM_MESSAGE", [
    KRW,
    USD,
    EUR,
    rubPrice.toFixed(0),
    usdPrice.toFixed(0),
    invoiceSum,
    taxRub,
    utilSbor,
    sum,
  ]);
}

clientScene.command("price", async (ctx) => {
  await ctx.replyWithTitle("ENTER_PRICE");

  ctx.wizard.selectStep(0);
});

clientScene.command("volume", (ctx) => {
  if (ctx.wizard.cursor === 2) ctx.replyStep(1);
  else ctx.replyStep(ctx.wizard.cursor);
});

clientScene.command("age", (ctx) => {
  if (ctx.wizard.cursor === 2) ctx.replyStep(2);
  else ctx.replyStep(ctx.wizard.cursor);
});

clientScene.command("krw", async (ctx) => {
  ctx.replyStep(3);
});

clientScene.command("eur ", (ctx) => {
  ctx.replyStep(3);
});

clientScene.command("usd", (ctx) => {
  ctx.replyStep(3);
});

module.exports = [clientScene];
