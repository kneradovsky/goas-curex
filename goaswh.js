const { dialogflow, BasicCard, Permission, Table, Suggestions, Carousel } = require('actions-on-google');
const curcodes = require('./utils/currencies')()
const replies = require('./replies')()


module.exports = function(dataset) {
    return new GoasWebhook(dataset);
}

let ents = {
    ops : {
        buy : 'buy',
        sell : 'sell'
    }, 
    cashmark : {
        cash : 'cash',
        wire : 'wire'
    },
    evts : {
        CurrencyExchange : 'evt_currency_exchange',
        CurrencyRate : 'evt_currency_rate'
    },
    
}


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
        app.intent('CurrencyRate', (conv) => this.currencyRate(conv))
        app.intent('Geoposition',(conv,params,permissionGranted) => {
            console.log("permissions handler");
            this.handlePermissions(conv,params,permissionGranted)
        })
        this.app = app;
    }



    welcome(conv) {
        console.log('welcome')
        conv.user.storage.return='';
        if(conv.device.location) conv.user.storage.location = conv.device.location;
        if(!conv.user.storage.location) 
             this.askForLocationPermissions(conv)
        else {
            conv.ask(replies.welcome())
        }
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
        conv.user.storage.location = conv.device.location;
        console.log(conv.user.storage);
        if(ents.evts.hasOwnProperty(conv.user.storage.return)) {
            conv.followup(ents.evts[conv.user.storage.return],conv.user.storage.returnparams)
            conv.user.storage.return=null;
            conv.user.storage.returnparams=null;
        } else this.welcome(conv);
    }

    async currencyExchange(conv) {
        console.log("currencies")
        if(!conv.user.storage.location) {            
            return this.askForLocationPermissions(conv)
        }
        var allparams = true;
        for (const param in conv.parameters) {
            const element = conv.parameters[param];
            if(element=='') {allparams=false;break;}
        }
        if(!allparams) return conv.ask();
        let params  = conv.parameters;
        let currencies = await this.ds.loadCurrencies(conv.user.storage.location.city);
        let curcode = Number(curcodes[params.currency]);
        let opercourse = params.cashmark == ents.cashmark.cash ? currencies.Currencies.Cash : currencies.Currencies.Online;
        let course = this.findCourse(opercourse,params.operation,curcode);
        console.log(course);
        let amount = course * params.amount;
        console.log(amount)
        let msg_gen = params.operation == ents.ops.sell ? replies.currency_sell : replies.currency_buy;
        conv.ask(msg_gen(params.amount,amount,params.currency,params.cashmark == ents.cashmark.cash))
        return conv;
    }

    async currencyRate(conv) {
        console.log("currencyRate")
        console.log(conv.parameters)
        if(!conv.user.storage.location) {            
            return this.askForLocationPermissions(conv)
        }
        let params = conv.parameters;
        if(params.cashmark=='') params.cashmark=ents.cashmark.cash;
        let currencies = await this.ds.loadCurrencies(conv.user.storage.location.city);
        let curcode = Number(curcodes[params.currency]);
        let opercourse = params.cashmark == ents.cashmark.cash ? currencies.Currencies.Cash : currencies.Currencies.Online;
        let courseBuy = this.findCourse(opercourse,ents.ops.buy,curcode);
        let courseSell = this.findCourse(opercourse,ents.ops.sell,curcode);
        if(!conv.screen) {
            conv.ask('Курс покупки - '+courseBuy)
            conv.ask('Курс продажи - '+courseSell)
            return;
        }
        conv.ask(replies.currate_banner(params.cashmark))
        conv.ask(new Table({
            title: params.currency,
            subtitle: params.cashmark == ents.cashmark.cash ? 'Наличными' : 'Безналично',
            columns: [
                {
                    header: 'Покупка',
                    align: 'LEADING'
                },
                {
                    header: 'Продажа',
                    align: 'TRAILING'
                },
            ],
            rows: [
                {
                    cells : [""+courseBuy.toFixed(2),""+courseSell.toFixed(2)],
                    dividerAfter: false
                }
            ]
        }));
    }

    findCourse(courses,oper,c1,c2=810) {
        var from=c1,to=c2;
        if(oper != ents.ops.buy) {from=c2;to=c1};
        console.log(`${from} -> ${to}`)
        let pcourse = courses.filter( e => e[0]==from && e[1]==to);
        return pcourse[0][2];
    }

}

