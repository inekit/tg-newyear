const fsPromises = require("fs").promises;
const { exec } = require("child_process");
require("dotenv").config();

module.exports = async function freeStorage() {
  return new Promise((res, rej) => {
    exec("df -h > df.txt", (error) => {
      if (error) {
        rej(error);
      }
      space = fs
        .readFileSync("df.txt", (data, err) => {
          if (err) {
            rej(err);
          }
        })
        .toString()
        .match(/vda1(.+)/g)?.[0]
        ?.split(/\s+/)?.[3]
        .match(/([0-9]+)G/)?.[1];

      console.log(space);
      if (!space) rej();

      if (space < 20)
        fs.readdir("downloads", async function (err, files) {
          if (err) {
            rej(err);
          } else {
            let firstDate = new Date();
            let firstFile;
            for (file of files) {
              const tDate = new Date(
                (await fsPromises.stat(`downloads/${file}`))?.birthtime
              );

              if (tDate < firstDate) {
                firstDate = tDate;
                firstFile = `downloads/${file}`;
              }
            }
            firstFile && (await fsPromises.rm(firstFile));

            res();
          }
        });
    });
  });
};
