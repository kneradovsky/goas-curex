const { dialogflow, BasicCard, Permission, Suggestions, Carousel } = require('actions-on-google');
const curcodes = require('./utils/currencies')



module.exports = function(dataset) {
    return new GoasWebhook(dataset);
}

let intCurExch = 'CurrencyExchange';
let evtCurExch = 'currency_exchange';

class GoasWebhook {
    ds = {};
    constructor(dataset) {
        this.ds = dataset;
        this.initApp();
    }
    initApp() {
        let app = dialogflow({debug: false});
        app.intent('Default Welcome Intent', (conv) => this.welcome(conv))
        app.intent('CurrencyExchange',(conv) => this.currencyExchange(conv))
        app.intent('Geoposition',(conv,params,permissionGranted) => {
            console.log("permissions handler");
            this.handlePermissions(conv,params,permissionGranted)
        })
        this.app = app;
    }



    welcome(conv) {
        console.log('welcome')
        conv.user.storage.return='';
        if(!conv.user.storage.location) 
             this.askForLocationPermissions(conv)
        else {
            conv.ask("Я умею отображать курсы валют и расчитывать суммы операций обмена")
            conv.ask("Спроси меня: хочу поменять 225 евро")

        }
    }

    answerExchange(conv) {
        conv.close("12345678")
    }

    askForLocationPermissions(conv) {        
        console.log("permission");
        conv.user.storage.return = conv.intent;
        conv.user.storage.returnparams = conv.parameters;
        conv.ask(
            new Permission({context:"Необходимо найти ближайшее отделение", permissions: 'DEVICE_PRECISE_LOCATION'})
        );
        //conv.ask(new Suggestions(["Да","Нет"]));
        return conv;
    }

    handlePermissions(conv,params,permissionGranted) {
        console.log("granted");
        if(!permissionGranted) {
            conv.close('Необходимо предоставить разрешения для определения местоположения')
            return conv;          
        }
        console.log(conv);
        if(conv.user.storage.return==intCurExch) {
            conv.followup(evtCurExch,conv.user.storage.returnparams)
            conv.user.storage.return='';
            evtCurExch,conv.user.storage.returnparams=null;
        }
    }

    async currencyExchange(conv) {
        if(!conv.user.storage.location) {            
            return this.askForLocationPermissions(conv)
        }
        var allparams = true;
        for (const param in conv.parameters) {
            const element = conv.parameters[param];
            if(element=='') {allparams=false;break;}
        }
        if(!allparams) return conv;
        let currencies = await this.ds.loadCurrencies(conv.user.storage.location.city);
        console.log(currencies);
        console.log(conv.parameters);
        let course = this.findCourse(currencies,conv.parameters.operation,curcodes[conv.parameters.currency]);
        console.log(course);
        let amount = course * conv.parameters.amount;
        console.log(amount)

        conv.ask(amount+'')
        return conv;
    }

    findCourse(courses,oper,code) {
        return 10.0;
    }

}

