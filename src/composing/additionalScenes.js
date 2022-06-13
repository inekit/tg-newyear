const { Telegraf, Composer, Scenes: { WizardScene } } = require('telegraf')
const CustomWizardScene = require('../scene')

const getScenes = async (config)=>{
	const scenesData = await config;

	const scenes = scenesData.map((sceneData)=>{
        const scene = new CustomWizardScene(sceneData.name)
        for (step of sceneData.steps) {
            scene.addStep(step);
        }

        return [sceneData.name, scene]
       
    })

    return scenes

}


module.exports = getScenes
