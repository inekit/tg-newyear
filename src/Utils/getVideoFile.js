var Nightmare = require("nightmare");
const fs = require("fs");
const { exec } = require("child_process");
const freeStorage = require("../Utils/freeStorage");
//const Xvfb = require("xvfb");

//let xvfb = new Xvfb();

module.exports = function getVideoFile(
  id,
  scenario,
  name,
  name_second,
  hobby,
  action
) {
  return new Promise((resolve, rej) => {
    //xvfb.start(function (err, xvfbProcess) {
    Nightmare.action(
      "onBeforeSendHeaders",
      function (name, options, parent, win, renderer, done) {
        win.webContents.session.webRequest.onBeforeSendHeaders(
          (details, cb) => {
            parent.call("onBeforeSendHeaders", details, (res) => {
              res ? cb(Object.assign({}, res)) : cb({ cancel: false });
            });
          }
        );
        done();
      },
      function (handler, done) {
        this.child.respondTo("onBeforeSendHeaders", handler);
        done();
      }
    );

    const request =
      scenario === "one_kid"
        ? `https://newyear.mail.ru/?name=${name}&scenario=${scenario}&hobby=${hobby}&action=${action}`
        : scenario === "two_kids"
        ? `https://newyear.mail.ru/?name=${name}&name_second=${name_second}&scenario=${scenario}&action=${action}`
        : `https://newyear.mail.ru/?scenario=${scenario}&action=${action}`;

    const nightmare = Nightmare({ show: false, waitTimeout: 40000 });

    nightmare
      .onBeforeSendHeaders((details, cb) => {
        if (/^.+\.m3u8$/.test(details?.url)) {
          console.log(details?.url);
          fs.rmSync(`downloads/${id}`, { recursive: true, force: true });

          freeStorage()
            .catch(console.log)
            .finally(() => {
              const downloader = require("m3u8-multi-thread-downloader");

              downloader.download({
                url: details?.url,
                processNum: 1,
                filePath: "downloads",
                fileName: `${id}`,
              });
            });
        }

        cb({ cancel: false });
      })
      .goto(request)
      .click(".js-play-name")
      .end()
      .then((res) => {
        fs.watchFile(`downloads/${id}/${id}.mp4`, (curr, prev) => {
          try {
            if (fs.lstatSync(`downloads/${id}/${id}.mp4`).isFile()) {
              console.log("file downloaded");
              const cmd = `ffmpeg -i downloads/${id}/${id}.mp4 -vf scale=850:480 downloads/${id}/${id}cropped.mp4`;

              resolve([`downloads/${id}/${id}.mp4`, `downloads/${id}/`]);
              /*exec(cmd, (error) => {
                if (error) {
                  return rej();
                }
                console.log("file cropped");
                resolve([
                  `downloads/${id}/${id}cropped.mp4`,
                  `downloads/${id}/`,
                ]);
              });*/
            }
          } catch {}
        });
      });
    //xvfb.stop(function (err) {});
    //});
  });
};
