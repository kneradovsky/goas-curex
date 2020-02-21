const https = require('https');

const urlCurrencies = "https://www.open.ru/storage/mobile/currencies.json";
const urlBranches = "https://www.open.ru/storage/mobile/offices_atms.json";

 class Datasets {
    currencies=[];
    branches=[];
    branchesByGeo = {};
    currenciesByCity={}
    timeoutBranches;
    timeoutCurrencies;

    constructor() {
        //this.loadBranches();
        this.loadCurrencies();
    }

    loadBranches() {
        https.get(urlBranches,(res)=>{
            this.processJSON(res,(obj) => this.processBranches(obj));
        });
        setTimeout(() => this.loadBranches,24*3600*1000); //load branches once a day        
    }

    loadCurrencies() {
        https.get(urlCurrencies, (res) => {
            this.processJSON(res,(obj) => this.processCurrencies(obj));
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



    processBranches(obj) {
        this.branches = obj.data.poi_list;
        const brByGeo = {};
        this.branches.forEach((br) => {
            latt = Math.floor(br.latitude).toFixed(0);
            long = Math.floor(br.longitude).toFixed(0);
            if(brByGeo[long] === undefined) brByGeo[long]={}
            brByGeo[long][latt]=br;
        });
        this.branchesByGeo = brByGeo;
    }

    processCurrencies(obj) {
        this.currencies = obj.data.currencies;
        const curByCity = {};
        this.currencies.forEach((cur)=> {
            curByCity[cur.city]=cur;
        });
        this.currenciesByCity=curByCity;
    }

    getClosestPOS(geo) {
        latt = Math.floor(geo.latitude).toFixed(0);
        long = Math.floor(geo.longitude).toFixed(0);
        var distance = 200;
        var closestBranch=null;
        for (const br of this.branches) {
            brdistance = Math.sqrt(Math.pow(geo.latitude-br.latitude,2)+Math.pow(geo.longitude-br.longitude,2));
            if(brdistance<distance) {
                distance=brdistance;
                closestBranch=br;
            }
        }
        return closestBranch;
    }
}

module.exports = new Datasets();