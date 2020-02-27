const { dialogflow, BasicCard, Permission, Suggestions, Carousel } = require('actions-on-google');
const curcodes = require('./utils/currencies')



module.exports = function(dataset) {
    return new GoasWebhook(dataset);
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
        app.intent('Geoposition',(conv,params,permissionGranted) => {
            console.log("permissions handler");
            this.handlePermissions(conv,params,permissionGranted)
        })
        this.app = app;
    }

    processRequest(req,res) {
    }

    welcome(conv) {
        console.log(conv.device);
        console.log(conv.user);
        if(!conv.user.storage.location) 
            return this.askForLocationPermissions(conv)
        else 
            return this.answerExchange(conv)
    }

    answerExchange(conv) {
        conv.close("12345678")
        return conv;
    }

    askForLocationPermissions(conv) {        
        console.log("pemission");
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
        conv.user.storage.location=conv.device.location;
        
        return this.answerExchange(conv);
    }

}

