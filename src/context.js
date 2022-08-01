const { Middleware, Context } = require("telegraf");
//import { SceneContextScene, WizardSession, WizardSessionData } from "telegraf/typings/scenes";
//import { SessionContext } from "telegraf/typings/session";
const replyTemplates = require("./replyTemplates");
const {
  Telegraf,
  Composer,
  Scenes: { WizardScene, WizardContextWizard },
} = require("telegraf");
const { Step, Steps } = require("./steps");

module.exports = class CustomContextWizard extends WizardContextWizard {
  constructor(ctx, steps) {
    //console.log(steps?.getHandlers())
    super(ctx, steps?.getHandlers());

    this.stepsArray = steps;
  }
};
