// Helpers for various various tasks

// Dependencies
const crypto = require('crypto');
const config = require('./config');

var helpers = {};

helpers.hash = function(str){
    if(typeof(str)=="string" && str.length>0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        console.log(this);
        return hash;
    }
}

helpers.parseJsonObject = function(str){
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (err) {
        console.log("Error in Parsing JSON ",err);
        return {};
    }
}


module.exports = helpers;