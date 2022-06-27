const { Composer, Context,Middleware,Scenes } = require("telegraf");
const { BaseScene, SceneContextScene, WizardContextWizard, } = Scenes//WizardSessionData
//import { SceneOptions } from "telegraf/typings/scenes/base"
const CustomContextWizard = require("./context")
const {Step, Steps} = require('./steps')
const replyTemplates = require('./replyTemplates');

module.exports = class CustomWizardScene
  extends BaseScene{
  //constructor(id, ...steps)
  constructor(id,options,...steps) {
    let opts;
    let s;
    if (typeof options === 'function' || (options?.isArray() && 'middleware' in options)) {
      opts = undefined
      s = [options, ...steps]
    } else {
      opts = options
      s = steps
    }
    super(id, opts)
    console.log()
    this.steps = new Steps(s)
   
    
  }

  getLength = ()=>this.steps.length

  addStep = (stepParams) => {

    //console.log(variable, skipText)
    //this.startFrom = startFrom ?? this.startFrom

    this.steps.addStep(stepParams)

    return this

}

addHandler = (handler) => {

  this.steps.addStep(handler)

  return this

}

  addSelect = (stepParams) => {

    this.steps.addSelect(stepParams)

    return this

  }

  addMenu = (stepParams) => {

    this.steps.addMenu(stepParams, this.id)

    return this

  }

  async replyStep(ctx, cursor, previousInfo = false){

    if (cursor<0 || cursor>=this.steps.length) return;

    const {header,keyboard} = this.steps.getStepDataById(cursor)??{}
    
    //const nextStepInfo = this.steps.getStepDataById(cursor)

    console.log(keyboard)

    const {kbTop, kbBottom} = ctx.initKeyboards(keyboard)
  
    await ctx.sendInputReply(ctx,header, keyboard,keyboard, previousInfo)
  
    if (!ctx.wizard && cursor!==0) throw new Error('cant change step with no wizard')

    ctx.wizard?.selectStep(cursor)

    return this
  }


  middleware() {

    return Composer.compose([
      (ctx, next) => {

        ctx.replyStep = (cursor)=> this.replyStep(ctx, cursor, true)
        
        ctx.replyStepByVariable = (variable)=> {
          const cursor = this.steps.getStepDataByVariable(variable)
          if (!cursor) return ctx.replyWithTitle(`Нету шага для переменной ${variable}`)
   
          this.replyStep(ctx, cursor.id).catch(console.log)
        }

        ctx.replyNextStep = ()=> this.replyStep(ctx, ctx.wizard.cursor+1)
        
        ctx.replyPreviousStep = ()=> {
          const varName = this.steps.getStepDataById(ctx.wizard.cursor)?.variable
          //console.log(varName,ctx.wizard.cursor - 1)
          delete ctx.wizard.state.input?.[varName];
          this.replyStep(ctx, ctx.wizard.cursor - 1)
        }

        ctx.wizard = new CustomContextWizard(ctx, this.steps)
        return next()
      },
      super.middleware(),
      (ctx, next) => {
        if (ctx.wizard.step === undefined) {
          ctx.wizard.selectStep(0)
          return ctx.scene.leave()
        }
        return Composer.unwrap(ctx.wizard.step)(ctx, next)
      },
    ])
  }

  enterMiddleware() {
  if (this.enterHandler.toString().length === 21) this.enterHandler = (async (ctx,next) => {
    
    ctx.state.name = ctx.scene?.options?.defaultSession?.current

    this.replyStep(ctx, 0); 
    next();
  })
    return Composer.compose([this.enterHandler , this.middleware()])
  }
}

