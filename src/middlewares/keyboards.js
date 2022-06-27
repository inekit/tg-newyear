const { Markup } = require('telegraf')
//const store = require('../LocalStorage/store')

exports.custom_bottom_keyboard = (ctx, bNames, columns = 2) => {

    let k=Markup.keyboard([
	], { columns: 2 }).resize()

	console.log(bNames)
	bNames = bNames.reduce((prev, cur, i)=>{
		if (i%columns===0) {prev.push([ctx.getTitle(cur)]); return prev}
		else { prev[prev.length-1].push(ctx.getTitle(cur)); return prev}
	}, [])

    bNames.forEach((name)=>{
        k.reply_markup.keyboard.push(name)
    })


    return k;
}

exports.custom_botkeyboard = (ctx, registered) => {

	const buttons = [
		[ 
			ctx.getTitle('BUTTON_ORDERS'),
			ctx.getTitle('BUTTON_CLIENTS')
		],
		[ 
			ctx.getTitle('BUTTON_AGENT_PROFILE'),
		],
		[ 
			ctx.getTitle('BUTTON_CHOOSE_ROLE'),
		],
	]

	return Markup.keyboard(buttons).resize()
}

exports.pay_agent_keyboard = (ctx) => Markup.keyboard([

	ctx.getTitle('BUTTON_PAY_AGENT_SUBSCRIPTION'),
	ctx.getTitle('BUTTON_CHOOSE_ROLE'),

], { columns: 1 }).resize()

exports.pay_alpinist_keyboard = (ctx) => Markup.keyboard([

	ctx.getTitle('BUTTON_PAY_ALPINIST_SUBSCRIPTION'),
	ctx.getTitle('BUTTON_CHOOSE_ROLE'),

], { columns: 1 }).resize()


exports.admin_main_keyboard = ctx=>Markup.keyboard([

	[
		ctx.getTitle('BUTTON_STATISTICS'),
	],
	[
		ctx.getTitle('BUTTON_CITIES'),		
	],
	[ 
		ctx.getTitle('BUTTON_CLIENT_MENU'),
	],

]).resize();

exports.admin_main_keyboard_owner = ctx => 
 Markup.keyboard([

	[
		ctx.getTitle('BUTTON_CATEGORIES'),		
	],
	[ctx.getTitle('BUTTON_ADMINS')],
	[ 
		ctx.getTitle('BUTTON_CLIENT_MENU'),
	],

]).resize();


exports.main_keyboard = (ctx, isAgent,isAlpinist) => {

	const buttons = []

	buttons.push([ 
		ctx.getTitle(isAgent ? 'BUTTON_AGENT_MENU' : 'BUTTON_REGISTER_AGENT')
	])

    buttons.push([ 
		ctx.getTitle(isAlpinist ? 'BUTTON_ALPINIST_MENU' : 'BUTTON_REGISTER_ALPINIST')
	])

	return Markup.keyboard(buttons).resize()
} 



exports.main_menu_goback_keyboard = (ctx) => Markup.keyboard([

	ctx.getTitle('BUTTON_GO_BACK'),
	ctx.getTitle('BUTTON_MAIN_MENU')

], { columns: 1 }).resize()


exports.send_location_keyboard = (ctx) => {

    const keyboard =  Markup.keyboard([
		Markup.button.locationRequest(ctx.getTitle("SEND_LOCATION_BUTTON")),	
		ctx.getTitle('BUTTON_BACK_USER')
	])

    return keyboard.resize()
}

exports.send_location_keyboard_admin = (ctx) => {

    const keyboard =  Markup.keyboard([
		Markup.button.locationRequest(ctx.getTitle("SEND_LOCATION_BUTTON")),	
		ctx.getTitle('BUTTON_BACK_ADMIN')
	])

    return keyboard.resize()
}

exports.main_menu_back_keyboard = (ctx) => Markup.keyboard([ ctx.getTitle('BUTTON_BACK_USER') ]).resize()

exports.alpinist_back_keyboard = (ctx) => Markup.keyboard([ ctx.getTitle('BUTTON_BACK_ALPINIST') ]).resize()

exports.admin_back_keyboard = (ctx) => Markup.keyboard([ ctx.getTitle('BUTTON_BACK_ADMIN') ]).resize()



exports.remove_keyboard = () => Markup.removeKeyboard()