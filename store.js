const editJsonFile = require("edit-json-file");
const Category = require("./db/entity/Category");

let file = editJsonFile(`categories.json`, {
    autosave: true
});

let all = editJsonFile(`all.json`, {
    autosave: true
});


function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

const getCategories = ()=>{return Object.keys(file.get()??{})};
const getRandomLink = (category)=>{
    const categoryLinks = file.get(category)


    return categoryLinks?.[randomInteger(0,categoryLinks?.length-1)]
}
module.exports = {
    addLink: (category, link)=>{
        if (!category) all.append('all',link);
        file.append(category,link)
    },
    clear: ()=>{file.empty();},
    addCategory:(name)=>{
        file.set(name, [])
    },
    getCategories,getRandomLink,
    getCategoriesWithLinks:()=>{
        const categories = getCategories();

        return categories.reduce((prev, cur)=>{
                prev[cur] = getRandomLink(cur);
                return prev;
            }, {})
    },
    deleteCategory:(category)=>{
        console.log(category)
        file.set(category,undefined)
    },
    importCategoryArray:(category, array)=>{
        if (!category) {return all.set('all',array)}
        file.set(category,array)
    },
    getAllRandomLink:()=>{
        const links = all.get('all')


        return links?.[randomInteger(0,links?.length-1)]
    }
    
}