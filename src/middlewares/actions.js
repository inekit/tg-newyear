const {passedConfines, initKeyboards, sendInputReply, deleteMessage} = require("./middlewares")
//const store = require("../LocalStorage/store");
const middlewares = require('./middlewares')

module.exports = {
    async addInput(ctx, stepName, header, confineNames, kbName, isLast){

        await ctx.answerCbQuery().catch(console.log)


        if (!ctx.wizard.state.input) ctx.wizard.state.input = {}

        
        ctx.wizard.state.input[stepName] = /*store.getCashedValue(stepName, ctx.match[1] ?? ctx.match[0]) ??  */ctx.match[1] ?? ctx.match[0]

        //store.setOrderDraft(ctx.wizard.cursor, stepName, store.getCashedValue(stepName, ctx.match[1]) ?? ctx.match[1], ctx.from.id)

        
        const {kbTop, kbBottom} = initKeyboards(kbName)

        const {pm1,pm2,pm3} = await sendInputReply(ctx,header, kbTop,kbBottom)

        //deleteMessage(ctx,pm1,pm2,pm3)

        if (!isLast) ctx.wizard.next()

    },

    async sendUpdateChoice(ctx, parameters){

        await ctx.answerCbQuery().catch(console.log)
    
        let kbParams = [ parameters.map(v=>{return 'BUTTON_'+v.toUpperCase()}), parameters.map(v=>{return 'update_'+v})];
    
        ctx.editMenu(ctx.getTitle('WHAT_TO_UPDATE'), { name: 'custom_keyboard', args: kbParams } )
    
        ctx.wizard.next();
        
    },

    async recieveParamName(ctx, steps){

        await ctx.answerCbQuery().catch(console.log)
    
        const paramName = ctx.wizard.state.paramName = ctx.match[1]

        if (paramName === "address") {
            ctx.editMenu(ctx.getTitle('ENTER_COORDINATES'), 'skip_keyboard')
    
            return ctx.wizard.selectStep(3);
        } else if (paramName === "works") {
    
            const {kbBottom} = middlewares.initKeyboards("work")
            
            ctx.editMenu(ctx.getTitle('ENTER_WORKS'), kbBottom)
    
            return ctx.wizard.selectStep(4);
        } else if (paramName === "trip_opportunity") ctx.wizard.selectStep(6)
        else if (paramName === "education_type") ctx.wizard.selectStep(6)
        else if (paramName === "contract_type") ctx.wizard.selectStep(7)

        let stepParams = steps?.getByVariable(paramName)

        if (paramName === "contract_type") stepParams = {keyboard: middlewares.initKeyboards('cType').kbBottom}
        
        ctx.editMenu(ctx.getTitle('ENTER_'+ctx.match[1].toUpperCase()), stepParams?.keyboard)
        
        ctx.wizard.next();
    },

}