const ConfineChecker = require("./middlewares/confines");
const {initKeyboards, sendInputReply} = require("./middlewares/middlewares")
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');
//const store = require("../LocalStorage/store");

ConfineChecker.addConfines({date(){console.log(1)}})

module.exports= {

    async addSceneInput(ctx, {stepName, header, confineNames, kbName, isLast, sceneName}){

        if (!ctx.scene.state.input) ctx.scene.state.input = {}

        //console.log(ctx.scene.state.input)

        //console.log(stepName, header, confineNames, kbName, isLast, sceneName)

        if (!ConfineChecker.passedConfines(ctx?.message?.text,confineNames, stepName)) return ctx.replyWithTitle("TRY_AGAIN")
        
        ctx.scene.state.input[stepName] = ctx.message?.text;

        if (ctx.scene.state.sceneName === "ordersScene") store.setOrderDraft(ctx.wizard.cursor, stepName, ctx.message?.text, ctx.from.id)

        const {kbTop, kbBottom} = initKeyboards(kbName)

        //console.log(header, kbTop,kbBottom)

        const {pm1,pm2,pm3} = await sendInputReply(ctx,header, kbTop,kbBottom)

        //deleteMessage(ctx,pm1,pm2,pm3)

        if (!isLast) ctx.wizard.next()

    },

    confirmDialog(ctx, header, keyboard){

        ctx.wizard.next();
        if (!header)  return;

        if (!keyboard) return ctx.replyWithTitle(header)
        
        ctx.replyWithKeyboard(header, keyboard)
        
    },
    
    addMigrateID(ctx, paramName){

        let new_id
    
        if (!ctx.scene.state.migrateStarted) return;
        
        if (ctx.message?.forward_from) new_id = (ctx.message?.forward_from?.id);
    
        else if (/^[0-9]+$/g.test(ctx.message?.text)) new_id = ctx.message?.text;
    
        else return ctx.replyWithTitle("TRY_AGAIN")
    
    
        if (!new_id) return
    
        ctx.wizard.state.paramName = paramName
    
        ctx.wizard.state.input = {}

        ctx.wizard.state.input[paramName] = new_id
    
        ctx.replyWithKeyboard("CONFIRM", "confirm_keyboard")
    
        //ctx.tg.sendMessage(new_id, "MIGRATED")
    },
    async addPhoto(ctx, stepName, header, confineNames, kbName, isLast){

        const file_id = ctx.message?.photo?.[0]?.file_id

        if (!file_id) return ctx.replyWithTitle("TRY_AGAIN")

        ctx.wizard.state.input[stepName] = file_id

        const {kbTop, kbBottom} = initKeyboards(kbName)

        sendInputReply(ctx, header, kbTop, kbBottom)
        
        if (!isLast) ctx.wizard.next()


    }
    
}


