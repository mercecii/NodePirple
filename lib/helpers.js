// Helpers for various various tasks

// Dependencies
const crypto = require('crypto');
const config = require('./config');

var helpers = {};

helpers.hash = function(str){
    if(typeof(str)=="string" && str.length>0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        debugger;
        console.log(this);
        return this.hash;
    }
}