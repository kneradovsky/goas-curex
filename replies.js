module.exports = function() {
    return {
        "welcome" : () => "Я умею отображать курсы валют и расчитывать суммы операций обмена\nСпроси меня: хочу поменять 225 евро",
        "currency_sell": (amount1,amount2,currency,cash=true) => `При продаже ${amount1} ${curname(currency,amount1)} Вы получите ${amount2} ${curname('RUR',amount2)} ${cash ? 'наличными' : 'онлайн'}`,
        "currency_buy" : (amount1,amount2,currency,cash=true) => `${amount1} ${curname(currency,amount1)} можно купить за ${amount2} ${curname('RUR',amount2)} ${cash ? 'наличными' : 'онлайн'}`,
        'currate_banner': (cash=true) => cash ? "Наличный курс обмена" : "Безналичный курс обмена",
        "roubles_sell" : (amountrur,amountcur,currency,cash=true) => `При обмене ${amountrur} ${curname('RUR',amountrur)} на ${curname(currency,1)} Вы получите ${amountcur} ${curname(currency,amountcur)} ${cash ? 'наличными' : 'онлайн'}`
    }
}

function curname(curcode,amnt) {
    let rem = Number(amnt).toFixed(0)%10;
    switch(curcode) {
        case 'EUR' : return "евро";
        case 'USD' : return rem >= 5 || rem==0 ?  "долларов" : rem >= 2 ? "доллара" : "доллар";
        case 'GBP' : return rem >= 5 || rem==0 ? "фунтов" : rem >= 2 ? "фунта" : "фунт";;
        case 'CHF' : return rem >= 5 || rem==0 ? "франков" : rem >= 2 ? "франка" : "франк";
        case 'RUR' : return rem >= 5 || rem==0 ? "рублей" : rem >= 2 ? "рубля" : "рубль";
    }
}