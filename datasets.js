const https = require('https');

const urlCurrencies = "https://www.open.ru/storage/mobile/currencies.json";
const urlBranches = "https://www.open.ru/storage/mobile/offices_atms.json";

 class Datasets {
    currencies={};
    branches={};
    timeoutBranches;
    timeoutCurrencies;

    constructor() {
        this.loadBranches();
        this.loadCurrencies();
    }

    loadBranches() {
        https.get(urlBranches,(res)=>{
            this.processJSON(res,(obj) => this.branches=obj.data);
        });
        setTimeout(() => this.loadBranches,24*3600*1000); //load branches once a day        
    }

    loadCurrencies() {
        https.get(urlCurrencies, (res) => {
            this.processJSON(res,(obj) => this.currencies = obj.data);
        })
        setTimeout(() => this.currencies,3600*1000); //load currencies every hour
    }


    processJSON(res,endcb) {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
            const parsedData = JSON.parse(rawData);
            endcb(parsedData);
            //console.log(parsedData);
            } catch (e) {
            console.error(e.message);
            }});
    }
}

module.exports = new Datasets();