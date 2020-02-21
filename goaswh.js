const { dialogflow, BasicCard, Permission, Suggestions, Carousel } = require('actions-on-google');



module.exports = function(dataset) {
    return new GoasWebhook(dataset);
}


class GoasWebhook {
    ds = {};
    constructor(dataset) {
        this.ds = dataset;
    }
    processRequest(req,res) {
        let app = dialogflow(req,res);
        app.intent('Default Welcome Intent', (conv,params) => this.welcome(conv,params))
        app.intent(['Default Welcome Intent - yes','Default Welcome Intent - no'],(conv,params) => this.welcome(conv,params))
        app.intent(['Geoposition'],(conv,params,permissionGranted) => this.handlePermissions(conv,params,permissionGranted))
    }

    welcome(conv,params) {
        console.log(conv.parameters)
        if(conv.parameters['cash']=='') {
            conv.contexts.set('FOLLOWUP','CASH');
            conv.ask('Наличными?')
            conv.add(new Suggestions("Да","Нет"))
        } else {
            if(!conv.user.storage.location) 
                this.askForLocationPermissions(conv)
            else 
                this.answerExchange(conv)
        }        
    }

    answerExchange(conv) {
        conv.close("12345678")
    }

    askForLocationPermissions(conv) {
        conv.askForPermissions(
            new Permission({context:"Необходимо найти ближайшее отделение", permissions: ['DEVICE_COARSE_LOCATION']})
        )
    }

    handlePermissions(conv,params,permissionGranted) {
        if(!permissionGranted) {
            conv.close('Необходимо предоставить разрешения для определения местоположения')            
            return;
        }
        this.welcome(conv,params);
    }

    fallback(agent) {

    }
    other(agent) {

    }
}

