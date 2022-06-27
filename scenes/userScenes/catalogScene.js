const { Telegraf, Composer, Scenes: { WizardScene, BaseScene } } = require('telegraf')
const titles = require('telegraf-steps-engine/middlewares/titles')
const moment=require("moment")
const categoryHandler = new Composer(),
subCategoryHandler = new Composer(),
itemHandler = new Composer();
const tOrmCon = require("../../db/data-source");
const { CustomWizardScene} = require('telegraf-steps-engine');
const store = require('../../store')




const scene = new CustomWizardScene('catalogScene')
.enter(async ctx => {

    const { edit, category_id, category_name} = ctx.scene.state
    let keyboard;
    let title;
    

    ctx.scene.state.categories = store.getCategoriesWithLinks()

    if (!ctx.scene.state.categories) {ctx.replyWithTitle('NO_CATEGORIES'); ctx.scene.enter('clientScene')}

    keyboard = {name: 'categories_list_keyboard', args: [ctx.scene.state.categories]}
    title = ctx.getTitle("CHOOSE_CATEGORY")

    console.log(edit)

 
    if (edit) return ctx.editMenu(title, keyboard)

    await ctx.replyWithKeyboard('⚙️', 'admin_back_keyboard')
    ctx.replyWithKeyboard(title, keyboard)
})


scene.action(/^category\-(.+)$/g, async ctx => {
    
    const category_name = ctx.scene.state.category_name = ctx.match[1];

    const link = store.getRandomLink(category_name)

    if (!link) return await ctx.answerCbQuery('NO_ITEMS_YET').catch(console.log);

    await ctx.answerCbQuery().catch(console.log);

    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());
    
    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

    ctx.scene.state.temp_post = await ctx.replyWithKeyboard('ITEM_CARD_CATEGORY', {name: 'item_keyboard', args: [link, category_name]}, [category_name, cTitle])
    //ctx.scene.reenter({edit: true});
})

scene.action('random_link', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    const category_name = ctx.scene.state.category_name 

    const link = store.getAllRandomLink();

    const cNameExec = /^https\:\/\/t.me\/(.+)$/g.exec(link?.trim());

    const cTitle = cNameExec?.[1] ? '@'+cNameExec[1] : link

    ctx.scene.state.temp_post = await ctx.editMenu('ITEM_CARD_CATEGORY', {name: 'item_keyboard', args: [link, category_name]}, [category_name, cTitle])
    
})

scene.action('hide', async ctx => {
    ctx.answerCbQuery().catch(console.log);
    ctx.scene.reenter({edit: true})
})

scene.action('next', async ctx => {
    ctx.answerCbQuery().catch(console.log);
    ctx.scene.reenter({edit: true})
})



scene.action('back', async ctx => {
    ctx.answerCbQuery().catch(console.log);

    ctx.scene.enter('clientScene',{edit: true})
})




module.exports = scene