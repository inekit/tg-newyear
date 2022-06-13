const { Telegraf, Scenes: { Stage }, Composer} = require('telegraf')

class jsonComposer {
    constructor(config){
        const scenes =  await require('./additionalScenes')(config)
        console.log(scenes)
        const stage = new Stage([ 
        ], {default: scenes?.[0]?.[0]});
        for (scene of scenes){
            stage.scenes.set(scene[0], scene[1])
        }
        this.stage = stage

    }
}



const config = {
    botId: '',
    stages: {
        mainStage: {
            scenes: [
                {name: 'faqScene', text: 'faq', 
                    steps: [{
                        type: 'input',
                        variable: 'a2'
                    },
                    {
                        type: 'input',
                        variable: 'a3'
                    }
                    ]
                },{name: 'catalogScene', text: 'catalog'}
            ],
            userGroup

        }
    }
}






const stages = new jsonComposer().stage
stages.use()

module.exports = stages