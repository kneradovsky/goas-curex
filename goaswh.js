
class GoasWebhook {
    constructor() {

    }
    processRequest(req,res) {
        res.status(200).send({goas:'ok'});
    }
}

module.exports = new GoasWebhook();