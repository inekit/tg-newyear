const { Telegraf, Composer, Scenes: { WizardScene } } = require('telegraf')
const titles = require('telegraf-steps-engine/middlewares/titles')
const moment=require("moment")
const deleteHandler = new Composer(),
cityNameHandler = new Composer(),
confirmHandler = new Composer();

const scene = new WizardScene('citiesScene', deleteHandler, cityNameHandler, confirmHandler)

const tOrmCon = require("../../db/data-source");

scene.enter(async ctx => {

    const { edit, main_menu_button, cityId,city} = ctx.scene.state

    const connection = await tOrmCon

    if (cityId) {
        ctx.scene.state.deletingId = cityId;
        ctx.scene.state.cityName = city;

        ctx.editMenu(ctx.getTitle("CITY_CARD", [city]), 'city_keyboard');
   
    }
    
    ctx.scene.state.cities = 
     await connection.query(`select *
     from navigator.cities c, navigator.admins b
     where b.userId = ?`,[ctx.from.id])
     .catch((e)=>{console.log(e); ctx.replyWithTitle("DB_ERROR") })


     if (!ctx.scene.state.cities) ctx.scene.enter('clientScene')

     const keyboard = {name: 'cities_list_admin_keyboard', args: [ctx.scene.state.cities]}
 
     const title = ctx.getTitle("CHOOSE_CITY")
 
     if (main_menu_button) await ctx.replyWithKeyboard('⚙️', main_menu_button)
 
     if (edit) return ctx.editMenu(title, keyboard)
    ctx.replyWithKeyboard(title, keyboard)
})



scene.action(/^city\-([0-9]+)$/g, async ctx => {

    ctx.scene.state.deletingId = ctx.match[1];

    const name = ctx.scene.state.cityName =  ctx.scene.state.cities.find((el)=>{return el.id === parseInt(ctx.match[1])})?.name

    ctx.editMenu(ctx.getTitle("CITY_CARD", [name]), 'city_keyboard');


})

deleteHandler.action('add_point', async ctx => {
    ctx.scene.enter('pointAddingScene',{city: ctx.scene.state.cityName, cityId: ctx.scene.state.deletingId});
})

deleteHandler.action('points', async ctx => {
    ctx.scene.enter('pointsScene',{city: ctx.scene.state.cityName, cityId: ctx.scene.state.deletingId});
})

deleteHandler.action('delete', async ctx => {

    ctx.editMenu(ctx.getTitle("CONFIRM"), 'confirm_keyboard');

})

deleteHandler.action('back', async ctx => {

    delete ctx.scene.state.deletingId, ctx.scene.state.cityId;

    ctx.scene.enter('citiesScene',{edit:true})

})

deleteHandler.action('confirm', async ctx => {

    const res = await require('../../Utils/authAdmin')(ctx.from.id, false)
    .catch(()=>{ ctx.answerCbQuery("CANT_AUTH");return ctx.scene.enter('clientScene');})

    if (!res) { return ctx.scene.enter('clientScene');}

    const connection = await tOrmCon
    await connection.getRepository("City").delete({id: ctx.scene.state.deletingId})
    .then(async ()=>{
        await ctx.answerCbQuery("CITY_HAS_BEEN_REMOVED").catch(console.log)
    })
    .catch(async (e)=>{ 
        console.log(e)
        await ctx.answerCbQuery("CITY_HAS_NOT_BEEN_REMOVED").catch(console.log) 
    })

    delete ctx.scene.state.deletingId

    return ctx.scene.reenter({edit:true})

})


scene.action('addCity', async ctx => {

    ctx.replyWithTitle("SEND_CITY_NAME")
    ctx.wizard.next()

})

cityNameHandler.on('message', ctx=>{
    ctx.scene.state.cityName = ctx.message?.text;
    ctx.replyWithKeyboard("CONFIRM", 'confirm_keyboard');
    ctx.wizard.next()
})


confirmHandler.action('confirm', async ctx=>{
    const {cityName} = ctx.scene.state
    
    const res = await (require('../../Utils/authAdmin')(ctx.from.id, false))
    .catch(()=>{ ctx.answerCbQuery("CANT_AUTH");return ctx.scene.enter('clientScene');})


    if (!res) { return ctx.scene.enter('clientScene');}

    const connection = await tOrmCon
    await connection.getRepository("City").insert({name: cityName})
    .then(async ()=>{
        await ctx.answerCbQuery("CITY_HAS_BEEN_ADDED").catch(console.log)
    })
    .catch(async ()=>{ 
        await ctx.answerCbQuery("CITY_HAS_NOT_BEEN_ADDED").catch(console.log) 
    })

    delete ctx.scene.state.cityName
  
    ctx.scene.reenter({edit:true})
})


module.exports = scene