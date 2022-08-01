const { Composer, Context, Middleware, Scenes } = require("telegraf");
const { BaseScene, SceneContextScene, WizardContextWizard } = Scenes; //WizardSessionData
//import { SceneOptions } from "telegraf/typings/scenes/base"
const CustomContextWizard = require("./context");
const { Step, Steps } = require("./steps");
const replyTemplates = require("./replyTemplates");

const { compose } = Composer;

module.exports = class CustomWizardScene extends BaseScene {
  //constructor(id, ...steps)
  constructor(id, options, ...steps) {
    let opts;
    let s;
    if (
      typeof options === "function" ||
      (options?.isArray() && "middleware" in options)
    ) {
      opts = undefined;
      s = [options, ...steps];
    } else {
      opts = options;
      s = steps;
    }
    super(id, opts);
    this.steps = new Steps(s);
  }

  enter(...fns) {
    this.enterHandler = compose([this.enterHandler, ...fns]);
    return this;
  }

  getLength = () => this.steps.length;

  addStep = (stepParams) => {
    //console.log(variable, skipText)
    //this.startFrom = startFrom ?? this.startFrom

    this.steps.addStep(stepParams);

    return this;
  };

  addHandler = (handler) => {
    this.steps.addStep(handler);

    return this;
  };

  addSelect = (stepParams) => {
    this.steps.addSelect(stepParams);

    return this;
  };

  addMenu = (stepParams) => {
    this.steps.addMenu(stepParams, this.id);

    return this;
  };

  async replyStep(ctx, cursor, previousInfo = false, edit = false) {
    if (cursor < 0 || cursor >= this.steps.length) return;

    const { header, keyboard } = this.steps.getStepDataById(cursor) ?? {};

    //const nextStepInfo = this.steps.getStepDataById(cursor)

    //console.log(keyboard)

    const { kbTop, kbBottom } = ctx.initKeyboards(keyboard);

    if (header && header !== "ENTER_undefined")
      await ctx.sendInputReply(
        ctx,
        header,
        keyboard,
        keyboard,
        previousInfo,
        edit
      );

    if (!ctx.wizard && cursor !== 0)
      throw new Error("cant change step with no wizard");

    ctx.wizard?.selectStep(cursor);

    return this;
  }

  middleware(isEnter) {
    return Composer.compose([
      (ctx, next) => {
        ctx.replyStep = (cursor, edit) =>
          this.replyStep(ctx, cursor, true, edit);

        ctx.replyStepByVariable = (variable, edit) => {
          const cursor = this.steps.getStepDataByVariable(variable);
          if (!cursor)
            return ctx.replyWithTitle(`Нету шага для переменной ${variable}`);

          this.replyStep(ctx, cursor.id, false, edit).catch(console.log);
        };

        ctx.replyNextStep = (edit) =>
          this.replyStep(ctx, ctx.wizard.cursor + 1, false, edit);

        ctx.replyPreviousStep = (edit) => {
          const varName = this.steps.getStepDataById(
            ctx.wizard.cursor
          )?.variable;
          //console.log(varName,ctx.wizard.cursor - 1)
          delete ctx.wizard.state.input?.[varName];
          this.replyStep(ctx, ctx.wizard.cursor - 1, false, edit);
        };

        ctx.wizard = new CustomContextWizard(ctx, this.steps);

        //console.log(ctx.wizard)
        return next();
      },
      super.middleware(),
      (ctx, next) => {
        if (isEnter) return next();

        if (ctx.wizard.step === undefined) {
          ctx.wizard.selectStep(0);
          return ctx.scene.leave();
        }

        return Composer.unwrap(ctx.wizard.step)(ctx, next);
      },
    ]);
  }

  enterMiddleware() {
    const replyFirst = (ctx, next) => {
      ctx.state.name = ctx.scene?.options?.defaultSession?.current;

      this.replyStep(ctx, 0);
      next();
    };
    const enterAndReply = async (ctx, next) => {
      await this.enterHandler(ctx);
      //await replyFirst(ctx,next);
    };
    if (this.enterHandler.toString().length === 21)
      this.enterHandler = async (ctx, next) => replyFirst();
    return Composer.compose([this.middleware(true), enterAndReply]);
  }
};
