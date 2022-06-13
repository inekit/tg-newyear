const keyboards =  { 
	...require('./keyboards'), 
	...require('./inlineKeyboards')
}

module.exports = (obj, ctx) => obj?.name ? keyboards[obj.name](ctx, ...obj.args) : keyboards[obj](ctx)