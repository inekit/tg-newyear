const { _resolveUrl } = require("elasticsearch/src/lib/client_action");
const tOrmCon = require("../db/data-source");


module.exports = (tgId, canUpdateAdmins)=>new Promise(async (resolve, reject)=>{
    if (!tgId) throw new Error('no tg id')
    const connection = await tOrmCon
    connection.getRepository("Admin")
    .findOne({where: {userId: tgId, canUpdateAdmins}})
    .then(res=>{
        console.log(res)
        if (res) return resolve(res, connection)
        reject("NO SUCH ADMIN")
    }).catch((e)=>{ console.log(e); reject("DB_ERROR") })
})
