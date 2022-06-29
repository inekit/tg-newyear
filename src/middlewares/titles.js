const fs = require('fs');

class Titles {

	constructor(dataFolder = './Titles') {

        this.dataFolder = dataFolder

		const langs = fs.readdirSync(dataFolder, { withFileTypes: true })
		.filter(d => d.isDirectory())
		.map(d => d.name);

		this.dictionary = [];

		for (let lang of langs){
			let folder = `${dataFolder}/${lang}/`

			let obj = JSON.parse(fs.readFileSync(`${this.dataFolder}/ru/titles.json`, 'utf-8'))
			Object.keys(obj).map(key => this.dictionary[key] ? this.dictionary[key][lang] = obj[key] : this.dictionary[key] = {[lang]: obj[key]})
		}


	}

	insert(string, language, replacers) {

		const generator = (function* (replacers) {
			
			for(const replacer of replacers) {

				yield this.dictionary[replacer] ? this.dictionary[replacer][language] || this.dictionary[replacer] : replacer
			}

		}).bind(this)(replacers)

		return string.replaceAll(/\*/g, () => generator.next().value)
	}

	getTitle(title, language, replacers) {

		if(!this.dictionary[title]) {

			
			if (title?.toUpperCase() === title) {
			
				let file = JSON.parse(fs.readFileSync(`${this.dataFolder}/ru/titles.json`, 'utf-8'))
				file[title] = title
				fs.writeFileSync(`${this.dataFolder}/ru/titles.json`, JSON.stringify(file, null, 2));
	
			}
			
			return title
		}

		const string = this.dictionary[title][language] || this.dictionary[title]



		let res = replacers ? this.insert(string, language, replacers) : string

		return res;
	}

	setTitle(title, value) {

		this.dictionary[title] = value;

		let file = JSON.parse(fs.readFileSync(`${this.dataFolder}/ru/titles.json`, 'utf-8'))
		file[title] = value
		fs.writeFileSync(`${this.dataFolder}/ru/titles.json`, JSON.stringify(file, null, 2));
	}

	getValues(title) {

		const value = this.dictionary[title]

		return value ? typeof value === 'string' ? [ value ] : Object.values(value) : title
	}

	isInKey(title, value) {

		return this.getKeys(title).includes(value)
	}

	isInValue(title, value) {

		return this.getValues(title).includes(value)
	}
}

module.exports = new Titles()
