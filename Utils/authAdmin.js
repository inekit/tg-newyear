const tOrmCon = require("../db/connection");

module.exports = (tgId, can_update_admins) =>
  new Promise(async (resolve, reject) => {
    if (!tgId) throw new Error("no tg id");
    const connection = await tOrmCon;
    connection
      .query(
        "select * from admins where user_id = $1 and can_update_admins = true",
        [tgId]
      )
      .then((res) => {
        console.log(res);
        if (res?.[0]) return resolve(res, connection);
        reject("NO_SUCH_ADMIN");
      })
      .catch((e) => {
        console.log(e);
        reject("DB_ERROR");
      });
  });
