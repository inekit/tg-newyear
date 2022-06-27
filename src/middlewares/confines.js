const moment = require("moment");
const dateFormats = [
    'D.MMMM.YYYY',
    'DD.MM.YY',
    'DD.MM.YYYY',
    'DD.MM.YYYY'
  ];
const timeFormats = [
'HH.mm',
'h.mm',
];


class ConfineChecker {

    addConfines(confinesObj){
        const testingObj = Object.create(confinesObj);
        if (Object.getPrototypeOf(testingObj) === confinesObj) {
            Object.assign(this.confines, testingObj)
        }
    }

    passedConfines(text,confineNames, stepName){

        confineNames = (confineNames ?? [])

        confineNames.push(stepName)
    
        for (let name of confineNames){
            /*if (name==="laterDate") {
                if (!this.confines[name](text, ctx.wizard.state.input.dTimeStart?? "11.11.11")) return
            } else */
            if (this.confines[name] && !this.confines[name](text)) return
        }
    
        return true
    }

    confines = {
        
    
        //dtime_start(text) {return this.date(text)},
    
        time(text){
    
            if (!text) return
              
            return moment(text, timeFormats, true).isValid();
        },
    
        laterNow(text){
            if (!text) return;
        
            const now = moment()
            const date = moment(text, dateFormats, true)
        
            return date > now;
        },
    
        boolean(text){
            return text==1 || text == false
        },
    
    
        text(text){
            return this.string2000(text)
        },
    
    
        laterDate(dateLast, date2){
    
            dateLast = moment(dateLast, "DD.MM.YY")
            date2 = moment(date2, "DD.MM.YY")
    
            if (date2>= dateLast) return false;
            return true
        },

        name(text, ctx){
            return this.string45(text)
    
        },
        street(text){
            return this.string255(text)
        },
        house(text){
            return parseInt(text)==text
        },
        building(text){
            if (text.length <= 5) return true
        },
        address(text){
            return /^([а-яА-ЯЁё]{2,255})\s([0-9\/\.]{1,5})(\s([\wа-яА-ЯЁё0-9]{1,2}))?$/g.test(text)
        },

    
        number(text){
            if (parseInt(text)==text) return true;
        },
    
        string255(text){
            if (text.length <= 255) return true
        },
    
        string2000(text){
            if (text.length <= 2000) return true
        },
    
        string200(text){
            if (text.length <= 200) return true
        },
    
        string45(text){
            if (text.length <= 45) return true
        },
    }
    
  }

module.exports = new ConfineChecker()