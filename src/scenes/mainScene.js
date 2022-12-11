const {
  CustomWizardScene,
  handlers: { FilesHandler },
} = require("telegraf-steps");
const getVideoFile = require("../Utils/getVideoFile");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { exec } = require("child_process");
require("dotenv").config();

exec("df -h > df.txt", (error) => {
  if (error) {
    return console.log(error);
  }
  space = fs
    .readFileSync("df.txt", (data, err) => {
      if (err) {
        throw err;
      }
    })
    .toString()
    .match(/vda1(.+)/g)?.[0]
    ?.split(/\s/);

  console.log(space);
});

fs.readdir("downloads", async function (err, files) {
  if (err) {
    console.log("Error getting directory information.");
  } else {
    let firstDate = new Date();
    let firstFile;
    console.log(firstDate);
    for (file of files) {
      const tDate = new Date(
        (await fsPromises.stat(`downloads/${file}`))?.birthtime
      );

      if (tDate < firstDate) {
        firstDate = tDate;
        firstFile = `downloads/${file}`;
      }
    }
    console.log(firstDate, firstFile);
    firstFile && (await fsPromises.rm(firstFile));
  }
});

const clientScene = new CustomWizardScene("clientScene").enter(async (ctx) => {
  delete ctx.scene.state.input;

  ctx.replyWithKeyboard("START_TITLE", "new_appointment_keyboard");
});

clientScene.action("new_appointment", (ctx) => {
  ctx.answerCbQuery().catch((e) => {});
  ctx.replyStep(0);
});

clientScene
  .addSelect({
    variable: "scenario",
    options: {
      "Одного ребенка": "one_kid",
      "Двоих детей": "two_kids",
      "Компанию детей": "many_kids",
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      const scenario = ctx.match[0];
      ctx.wizard.state.input = { scenario };

      if (scenario !== "many_kids") return ctx.replyNextStep();

      ctx.replyStepByVariable("action");
    },
  })
  .addStep({
    variable: "name",
    cb: (ctx) => {
      ctx.wizard.state.input.name = ctx.message.text;
      if (ctx.wizard.state.input.scenario === "one_kid")
        return ctx.replyStepByVariable("age");
      return ctx.replyStepByVariable("name_second");
    },
  })
  .addStep({
    variable: "age",
    cb: (ctx) => {
      ctx.wizard.state.input.age = ctx.message.text;

      ctx.replyStepByVariable("hobby");
    },
  })
  .addStep({
    variable: "name_second",
    cb: (ctx) => {
      ctx.wizard.state.input.name_second = ctx.message.text;

      ctx.replyStepByVariable("action");
    },
  })
  .addSelect({
    variable: "hobby",
    options: {
      Читать: "knigi",
      Рисовать: "risovat",
      Гулять: "gulyat",
      "Заниматься спортом": "sport",
      "Смотреть мультики": "multiki",
      "Есть сладости": "sladosti",
      Петь: "pet",
      "Заниматься музыкой": "muzika",
      "Играть в игры": "igra",
      Танцевать: "tanec",
    },
  })
  .addSelect({
    variable: "action",
    options: {
      "Слушаться родителей": "roditeli",
      "Хорошо кушать": "kyshat",
      "Хорошо учиться": "ychitsya",
      "Найти новых друзей": "dryzia",
      "Читать больше книг": "knigi",
    },
  })
  .addSelect({
    variable: "payment",
    options: {
      "Я оплатил": "pay",
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      const { scenario, name, name_second, hobby, action } =
        ctx.wizard.state.input;

      const path = [scenario, name, name_second, hobby, action].join("_");

      await ctx.replyWithTitle("WAIT_PLEASE");

      const [fName, folder] = await getVideoFile(
        path,
        scenario,
        name,
        name_second,
        hobby,
        action
      );

      var newPath = folder.slice(0, -1) + ".mp4";

      fs.rename(fName, newPath, function (err) {
        if (err) throw err;
        console.log("Successfully renamed - AKA moved!");
      });
      fs.rmSync(folder, { recursive: true, force: true });

      const pathParts = fName.split("/");

      const fLink = `http://${process.env.SERVER_URI}:4000/${
        pathParts[pathParts.length - 1]
      }`;

      await ctx.replyWithVideo(fLink).catch((e) => {});

      ctx.replyWithKeyboard("Видео можно посмотреть по ссылке ниже", {
        name: "link_keyboard",
        args: [fLink],
      });

      /*const { info, list, upload, download } = require("ya-disk");

      const API_TOKEN =
        "y0_AgAAAABiFnDuAAjdJQAAAADWZbLz7SxYH_AxTiGWpQUj9PIkOjRhNRY";

      const fileToUpload = fName;
      const remotePath = `disk:/test.mp4`;

      try {
        const { href, method } = await upload.link(API_TOKEN, remotePath, true);
        const { request } = require("https");
        const { parse } = require("url");
        console.log(32323);
        const fileStream = fs.createReadStream(fileToUpload);
        const uploadStream = request({ ...parse(href), method });

        fileStream.pipe(uploadStream);
        fileStream.on("end", async (r) => {
          console.log(11, r);

          uploadStream.end();

          const { href } = await download.link(API_TOKEN, remotePath);

          console.log(href);
          fs.rmSync(folder, { recursive: true, force: true });
        });
      } catch (error) {
        console.error(error);
      }*/

      /*fs.readFile(fName, async function (err, data) {
        if (!err) {
          await ctx.replyWithVideo({ source: data });
          fs.rmSync(folder, { recursive: true, force: true });
          await ctx.replyNextStep();
        } else {
          console.log(err);
        }
      });*/
    },
  })
  .addSelect({
    variable: "ending",
    options: {
      "Сделать новый заказ": "new",
    },
    cb: async (ctx) => {
      await ctx.answerCbQuery().catch(console.log);

      if (ctx.match[0] === "new") {
        delete ctx.wizard.state.input;
        ctx.replyStep(0);
      }
    },
  });

module.exports = [clientScene];
