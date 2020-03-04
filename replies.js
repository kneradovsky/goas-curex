module.exports = function() {
    return {
        "welcome" : () => "Я умею отображать курсы валют и расчитывать суммы операций обмена\nСпроси меня: хочу поменять 225 евро",
        "currency_sell": (amount1,amount2,currency,cash=true) => `При продаже ${amount1} ${currency} Вы получите ${amount2} рублей ${cash ? 'наличными' : 'онлайн'}`,
        "currency_buy" : (amount1,amount2,currency,cash=true) => `${amount1} ${currency} можно купить за ${amount2} рублей ${cash ? 'наличными' : 'онлайн'}`,
        'currate_banner': (cash=true) => cash ? "Наличный курс обмена" : "Безналичный курс обмена"
    }
}