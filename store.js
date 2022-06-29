const editJsonFile = require("edit-json-file");
const Category = require("./db/entity/Category");

let file = editJsonFile(`categories.json`, {
    autosave: true
});

let all = editJsonFile(`all.json`, {
    autosave: true
});

const getCount = (category)=>{
    if (!category) return all.get('all')?.length ?? 0;
    else return file.get(category)?.length ?? 0;
}
function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

const getCategories = ()=>{return Object.keys(file.get()??{})};

//const categories = getCategories();


const getCategoriesWithCountStr = ()=>{
    const categories = getCategories();
    return ['Все каналы '+getCount(), ...categories.reduce((prev, cur)=>{
        prev.push(`${cur} ${file.get(cur)?.length ?? 0}`)
        return prev;
    }, [])]
}

function SortArray(name,name2){
    if (name < name2  ) {return -1;}
    if (name > name2 || name2?.substring(0, name.lastIndexOf(' ')==='Все каналы')) {return 1;}
    return 0;
}

const getCategoriesWithCountKbStr = ()=>{
    const categories = getCategories();
    return ['Все каналы '+getCount(), ...categories.reduce((prev, cur)=>{
        prev.push(`${cur} ${file.get(cur)?.length ?? 0}`)
        return prev;
    }, [])?.sort(SortArray)]
}

const getRandomLink = (category)=>{
    let categoryLinks;
    if (!category) categoryLinks = all.get('all')
    else categoryLinks = file.get(category)


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
    getCount,
    getCategories,getRandomLink,
    getCategoriesWithCount:()=>{
        const categories = getCategories();

        return categories.reduce((prev, cur)=>{
                prev[cur] = {count: file.get(cur)?.length ?? 0}
                return prev;
            }, {})
    },
    getCategoriesWithCountStr,getCategoriesWithCountKbStr,
    categoriesWithCountMas: getCategoriesWithCountStr(),
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