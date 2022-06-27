const { Telegraf, Composer, Scenes: { WizardScene } } = require('telegraf')
const titles = require('telegraf-steps-engine/middlewares/titles')
const moment=require("moment")
const adminIdHandler = new Composer(),
newIdHandler = new Composer(),
roleHandler = new Composer();

const scene = new WizardScene('adminsScene', adminIdHandler, newIdHandler, roleHandler)

const tOrmCon = require("../../db/data-source");

scene.enter(async ctx => {

    const { edit, main_menu_button } = ctx.scene.state

    const connection = await tOrmCon
    ctx.scene.state.admins = 
     await connection.query(`select a.userId, a.canUpdateAdmins 
     from channels.admins a, channels.admins b
     where b.userId = ?`,[ctx.from.id])
     .catch((e)=>{ console.log(e);ctx.answerCbQuery("DB_ERROR") })

    if (!ctx.scene.state.admins) return ctx.scene.enter('clientScene')
    let adminsStr = ctx.scene.state.admins.map(({userId, canUpdateAdmins})=> `<a href="tg://user?id=${userId}">${userId}</a> ${canUpdateAdmins?'Суперадмин':""}`).join("\n\n").toString()

    const keyboard = 'admins_actions_keyboard'
    const title = ctx.getTitle("CHOOSE_ADMIN",[adminsStr])

    if (main_menu_button) await ctx.replyWithKeyboard('⚙️', main_menu_button)

    if (edit) return ctx.editMenu(title, keyboard)
    ctx.replyWithKeyboard(title, keyboard)
})




scene.action('deleteAdmin', async ctx => {

    ctx.answerCbQuery().catch(console.log)

    console.log(ctx.scene.state.admins)//ctx.getChatMember(ctx.chat.id, '-*****')

    ctx.replyWithKeyboard("SELECT_ADMIN_TO_DELETE", {name:'admins_list_keyboard', args: [ctx.scene.state.admins]})

})

adminIdHandler.action(/^admin\-([0-9]+)$/g, async ctx => {

    ctx.scene.state.deletingId = ctx.match[1];

    ctx.replyWithKeyboard("CONFIRM_DELETE", 'confirm_keyboard');


})

adminIdHandler.action('confirm', async ctx => {

    const res = await require('../../Utils/authAdmin')(ctx.from.id, true)
    .catch(()=>{ ctx.answerCbQuery("CANT_AUTH");return ctx.scene.enter('clientScene');})

    if (!res) { return ctx.scene.enter('clientScene');}

    const connection = await tOrmCon
    await connection.getRepository("Admin").delete({userId: ctx.scene.state.deletingId})
    .then(async ()=>{
        await ctx.answerCbQuery("ADMIN_HAS_BEEN_REMOVED").catch(console.log)
    })
    .catch(async (e)=>{ 
        console.log(e)
        await ctx.answerCbQuery("ADMIN_HAS_NOT_BEEN_REMOVED").catch(console.log) 
    })

    delete ctx.scene.state.deletingId

    ctx.scene.reenter({edit:true})

})


scene.action('addAdmin', async ctx => {

    ctx.replyWithTitle("SEND_NEW_ID")
    ctx.wizard.next()

})

newIdHandler.on('message', ctx=>{
    ctx.scene.state.newId = ctx.message?.forward_from?.id ?? ctx.message?.text;
    ctx.replyWithKeyboard("ADD_AS_SUPERADMIN", 'confirm_cancel_keyboard');
})


newIdHandler.action('confirm', async ctx=>{
    ctx.scene.state.canUpdateAdmins = true;
    ctx.replyWithKeyboard("CONFIRM_ADDING", 'confirm_keyboard');
    ctx.wizard.next()

})

newIdHandler.action('cancel', async ctx=>{
    ctx.scene.state.canUpdateAdmins = false;
    ctx.replyWithKeyboard("CONFIRM_ADDING", 'confirm_keyboard');
    ctx.wizard.next()

})

roleHandler.action('confirm', async ctx=>{
    const {newId,canUpdateAdmins} = ctx.scene.state
    
    const res = await (require('../../Utils/authAdmin')(ctx.from.id, true))
    .catch(()=>{ ctx.answerCbQuery("CANT_AUTH");return ctx.scene.enter('clientScene');})

    if (!res) { return ctx.scene.enter('clientScene');}

    const connection = await tOrmCon
    await connection.getRepository("Admin").insert({userId: newId, canUpdateAdmins})
    .then(async ()=>{
        await ctx.answerCbQuery("ADMIN_HAS_BEEN_ADDED").catch(console.log)
    })
    .catch(async (e)=>{ 

        console.log(e)
        await ctx.answerCbQuery("ADMIN_HAS_NOT_BEEN_ADDED").catch(console.log) 
    })

    delete ctx.scene.state.newId, ctx.scene.state.canUpdateAdmins
  
    ctx.scene.reenter({edit:true})
})


module.exports = scene