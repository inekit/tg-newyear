const { Telegraf, Composer, Scenes: { WizardScene } } = require('telegraf')

const { CustomWizardScene, titles} = require('telegraf-steps-engine');
const { confirmDialog } = require('telegraf-steps-engine/replyTemplates');
const tOrmCon = require("../db/data-source");
const store = require('../store')

const clientScene = new CustomWizardScene('clientScene')
.enter(async ctx=>{

    const { edit } = ctx.scene.state

    const connection = await tOrmCon

    let userObj = (await connection.query(
            "SELECT id, DATEDIFF(now(),u.lastUse) loginAgo,userId FROM channels.users u left join channels.admins a on a.userId = u.id where u.id = ? limit 1", 
            [ctx.from?.id])
        .catch((e)=>{
            console.log(e)
            ctx.replyWithTitle("DB_ERROR")
        }))

    userObj = userObj?.[0]

    if (!userObj) {

        ctx.replyWithKeyboard("GREETING",'main_menu_back_keyboard')

        
        userObj = await connection.getRepository("User")
        .save({id: ctx.from.id})
        .catch((e)=>{
            console.log(e)
            ctx.replyWithTitle("DB_ERROR")
        })
    }
    
    if (userObj?.userId) await ctx.replyWithKeyboard("#", {name: 'custom_bottom_keyboard', args: [[['ADMIN_SCENE_BUTTON']]]})
    else if (userObj?.loginAgo!=="0") {
        await connection.query(
            "UPDATE channels.users u SET lastUse = now() WHERE id = ?", 
            [ctx.from?.id])
        .catch((e)=>{
            console.log(e)
            ctx.replyWithTitle("DB_ERROR")
        })
    }

    //console.log(store.getAllRandomLink())
    const keyboard =  'main_menu_keyboard'//{name: 'main_menu_keyboard', args: [store.getAllRandomLink(),userObj?.userId]};
    if (edit && !userObj?.userId) return ctx.editMenu("HOME_MENU", keyboard)
    await ctx.replyWithKeyboard("HOME_MENU",keyboard)
    
    
})	

clientScene.action('random_link', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    const link = store.getAllRandomLink();

    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    console.log(cNameExec, link)

    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

    ctx.scene.state.temp_post = await ctx.editMenu(ctx.getTitle('ITEM_CARD',[cTitle]), {name: 'item_keyboard_main', args: [link]})
    
})

clientScene.action('hide', async ctx => {
    ctx.answerCbQuery().catch(console.log);
    ctx.scene.reenter({edit: true})
})


clientScene.hears(titles.getTitle('CATALOG_BUTTON','ru'), ctx=>{
    
    ctx.scene.enter('catalogScene', )//.catch(e=>ctx.replyWithTitle(`Нет такой сцены`));
})

clientScene.action('categories',ctx=>{
    ctx.answerCbQuery().catch(console.log);

    ctx.scene.enter('catalogScene', {edit: true});
})
clientScene.action('admin_menu',ctx=>{
    ctx.answerCbQuery().catch(console.log);

    ctx.scene.enter('adminScene', {edit: true});
})


clientScene.hears(titles.getTitle('ADMIN_SCENE_BUTTON','ru'), ctx=>{
    ctx.scene.enter('adminScene')//.catch(e=>ctx.replyWithTitle(`Нет такой сцены`));
})

module.exports = [clientScene]
