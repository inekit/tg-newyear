const { CustomWizardScene, titles } = require("telegraf-steps-engine");
const CustomContextWizard = require("telegraf-steps-engine/context");
const dateFormats = ["D.MMMM.YYYY", "DD.MM.YY", "DD.MM.YYYY", "DD.MM.YYYY"];
const getCurrencies = require("../Utils/getCources");
const moment = require("moment");
function numberWithSpaces(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const clientScene = new CustomWizardScene("clientScene").enter(async (ctx) => {
  const { USD, EUR, KRW } = (ctx.scene.state.currencies =
    await getCurrencies());

  delete ctx.wizard.state.input;

  ctx.replyWithTitle("START_TITLE", [KRW, USD, EUR]);
});

clientScene.command("price", async (ctx) => {
  if (!ctx.scene.state.currencies) return; // ctx.scene.enter("clientScene");

  await ctx.replyWithTitle("ENTER_PRICE");

  ctx.wizard.selectStep(0);
});

clientScene.command("volume", (ctx) => {
  if (!ctx.scene.state.currencies) return; // ctx.scene.enter("clientScene");

  if (ctx.wizard.cursor === 2) ctx.replyStep(1);
  else ctx.replyStep(ctx.wizard.cursor);
});

clientScene.command("age", (ctx) => {
  if (!ctx.scene.state.currencies) return; // ctx.scene.enter("clientScene");

  if (ctx.wizard.cursor === 2) ctx.replyStep(2);
  else ctx.replyStep(ctx.wizard.cursor);
});

clientScene.command("krw", async (ctx) => {
  if (!ctx.scene.state.currencies) return; // ctx.scene.enter("clientScene");

  ctx.replyStep(5);
});

clientScene.command("eur", (ctx) => {
  if (!ctx.scene.state.currencies) return; // ctx.scene.enter("clientScene");

  ctx.replyStep(4);
});

clientScene.command("usd", (ctx) => {
  if (!ctx.scene.state.currencies) return; //ctx.scene.reenter();

  ctx.replyStep(3);
});

clientScene
  .addStep({
    variable: "price",
    cb: async (ctx) => {
      if (parseInt(ctx.message.text) != ctx.message.text)
        return ctx.replyWithTitle("ENTER_TEXT_PRICE");
      if (parseInt(ctx.message.text) < 5000000)
        await ctx.replyWithTitle("TOO_LOW_PRICE", [
          numberWithSpaces(
            (
              parseInt(ctx.message.text) /
              parseFloat(ctx.scene.state.currencies.KRW)
            ).toFixed(0)
          ),
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
    cb: async (ctx) => {
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
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      ctx.wizard.state.input.age = ctx.match[0];
      sendSum(ctx);
    },
  })
  .addStep({
    variable: "usd",
    cb: (ctx) => {
      if (parseFloat(ctx.message.text) != ctx.message.text)
        return ctx.replyWithTitle("ENTER_CORRECT_FLOAT");

      ctx.scene.state.currencies.USD = ctx.message.text;
      if (ctx.wizard.state.input?.volume && ctx.wizard.state.input?.age)
        return sendSum(ctx);
      if (ctx.wizard.state.input?.volume) return ctx.replyStep(2);
      if (ctx.wizard.state.input?.price) return ctx.replyStep(1);
      ctx.replyWithTitle("ENTER_PRICE");
      ctx.wizard.selectStep(0);
    },
  })
  .addStep({
    variable: "eur",
    cb: (ctx) => {
      if (parseFloat(ctx.message.text) != ctx.message.text)
        return ctx.replyWithTitle("ENTER_CORRECT_FLOAT");

      ctx.scene.state.currencies.EUR = ctx.message.text;
      if (ctx.wizard.state.input?.volume && ctx.wizard.state.input?.age)
        return sendSum(ctx);
      if (ctx.wizard.state.input?.volume) return ctx.replyStep(2);
      if (ctx.wizard.state.input?.price) return ctx.replyStep(1);
      ctx.replyWithTitle("ENTER_PRICE");
      ctx.wizard.selectStep(0);
    },
  })
  .addStep({
    variable: "krw",
    cb: (ctx) => {
      if (parseFloat(ctx.message.text) != ctx.message.text)
        return ctx.replyWithTitle("ENTER_CORRECT_FLOAT");

      ctx.scene.state.currencies.KRW = ctx.message.text;
      if (ctx.wizard.state.input?.volume && ctx.wizard.state.input?.age)
        return sendSum(ctx);
      if (ctx.wizard.state.input?.volume) return ctx.replyStep(2);
      if (ctx.wizard.state.input?.price) return ctx.replyStep(1);
      ctx.replyWithTitle("ENTER_PRICE");
      ctx.wizard.selectStep(0);
    },
  });

function sendSum(ctx) {
  let { USD, EUR, KRW } = ctx.scene.state.currencies;

  USD = USD.replace(",", ".");
  EUR = EUR.replace(",", ".");
  KRW = KRW.replace(",", ".");

  let { price, volume, age, date_register } = ctx.wizard.state.input;

  price = parseInt(price);

  volume = parseInt(volume);

  console.log(ctx.wizard.state.input, price, parseFloat(KRW));

  const rubPrice = (parseInt(price) / parseFloat(KRW)).toFixed(0);

  const usdPrice = (parseFloat(rubPrice) / parseFloat(USD)).toFixed(0);

  const eurPrice = (parseFloat(rubPrice) / parseFloat(EUR)).toFixed(0);

  if (date_register) {
    const date = moment(ctx.message?.text, dateFormats, true);
    const now = moment();
    age = now.diff(date, "year");
    console.log(age);
    age = age < 3 ? "0" : age.toString();
  }

  const utilSbor = age !== "0" ? 5300 : 3400;

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
        console.log(tax, parseInt(volume) <= maxVolume);
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

  let sbor;

  const prices = {
    200000: 775,
    450000: 1550,
    1200000: 3100,
    2700000: 8530,
    4200000: 12000,
    5500000: 15500,
    7000000: 20000,
    8000000: 23000,
    9000000: 25000,
    10000000: 27000,
    10000000000: 30000,
  };

  Object.entries(prices)
    .reverse()
    .forEach(([maxPrice, price]) => {
      if (parseInt(rubPrice) <= maxPrice) sbor = price;
    });

  const invoiceSum = (parseInt(usdPrice) + 300 + 250 + 1270).toFixed(0);

  console.log(parseInt(parseInt(usdPrice).toFixed(0)));

  const taxRub = (tax * parseFloat(EUR)).toFixed(0);

  console.log(taxRub);
  const sum = (
    parseInt(rubPrice) +
    parseInt(taxRub) +
    parseInt(sbor) +
    utilSbor +
    300 * parseFloat(USD) +
    250 * parseFloat(USD) +
    4000 +
    3000 +
    20000 +
    1270 * parseFloat(USD) +
    150000
  ).toFixed(0);

  ctx.replyWithTitle("SUM_MESSAGE", [
    KRW.tyString().replace(".", ","),
    USD.tyString().replace(".", ","),
    EUR.tyString().replace(".", ","),
    numberWithSpaces(rubPrice),
    numberWithSpaces(usdPrice),
    numberWithSpaces(invoiceSum),
    numberWithSpaces(taxRub),
    numberWithSpaces(sbor),
    numberWithSpaces(utilSbor),
    numberWithSpaces(sum),
  ]);
}

module.exports = [clientScene];
