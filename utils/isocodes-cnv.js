let fs = require("fs");
let content  = fs.readFileSync("iso-4217.json");
let data = JSON.parse(content);

converted = {}
data.forEach(el => {
    if(el.Alphabetic_Code==null || el.Numeric_Code==null) return;
    converted[el.Alphabetic_Code]=el.Numeric_Code;
});

result = JSON.stringify(converted,null,2);
result = "module.exports = function() {  return "+result+"\n};";

console.log(result);