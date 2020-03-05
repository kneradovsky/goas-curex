let dialogflow = require('dialogflow')
let structjson = require('./sctructjson')
let replies = require('./replies')();
let projectID = 'openbank-296e5';
let keyFile = './openbank-296e5-55c3ac91d65b.json'
let client = new dialogflow.SessionsClient({keyFilename: keyFile,projectId: projectID});


module.exports = async function(req,res) {
    let alreq = req.body;
    let intquery = alreq.request.command;
    let alres = {session:alreq.session,version:alreq.version}
    let dfsespath = client.sessionPath(projectID,alreq.session.session_id)
    let dfreq = {
        session: dfsespath,
        queryInput: {
          text: {
            text: intquery,
            parameters: {alisa:true},
            languageCode: 'ru-RU',
          },
        },
        queryParams : {
            payload : structjson.jsonToStructProto({'alisa': 'true'}),
        }
    };
    alres.response = {text:replies.welcome(),end_session:false};
    if(intquery!="") {
        try {
            responses = await client.detectIntent(dfreq);
        } catch(err) {
            console.log(err);
        }
        let resp = responses[0]
        let respjson = structjson.structProtoToJson(resp.queryResult.webhookPayload)
        let intent_response='Что?'
        if(respjson.google.richResponse===undefined)
            intent_response=resp.queryResult.fulfillmentText;
        else intent_response = respjson.google.richResponse.items.map(e => e.simpleResponse.textToSpeech).join("\n")
        alres.response = {text:intent_response,end_session:false};
    }
    res.status(200).send(JSON.stringify(alres));
}