const fs = require("fs");
// This lib is necessary, because Yandex Disk
// returns a 302 header when you try to download file
// using provided link
const { request } = require("https");
const { parse } = require("url");
const { info, list, upload, download, publish, meta } = require("ya-disk");

const API_TOKEN = "y0_AgAAAABiFnDuAAjdJQAAAADWZbLz7SxYH_AxTiGWpQUj9PIkOjRhNRY";
const file = "disk:/RPReplay_Final1670352765.MP4";

(async () => {
  try {
    const h = await download.link(API_TOKEN, file);

    console.log(h);
  } catch (err) {
    console.error(err);
  }
})();
