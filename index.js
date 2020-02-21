const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bodyparser = require('body-parser')
const expressjwt = require('express-jwt')
const basicauth = require('basic-auth')
const ds = require('./datasets.js')
const wh = require('./goaswh.js')(ds);


const goasuser = {
    user : 'goas',
    pass : 'jklop0'
}

const app = express();
app.use(cors());
app.use(bodyparser.json());
app.use((req,res,next) => {
    auth = basicauth(req);
    req.auth=auth;
    next();
})
app.listen(8080,() => console.log('Listening on 8080'));

app.post('/goas',(req,res) => {
    if(!req.auth) 
        return res.status(401).send("Unauthorized-1");
    if(req.auth.name != goasuser.user || req.auth.pass != goasuser.pass) 
        return res.status(401).send("Unauthorized-2");
    wh.processRequest(req,res);
})


app.get('/goas/currencies',(req,res) => {
    res.status(200).send({curcount:Object.keys(ds.currencies.currencies).length})
})

app.get('/goas/branches',(req,res)=>{
    res.status(200).send({branches:ds.branches.length})
})


