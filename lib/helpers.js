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

// Create a string of random alphanumeric chafracers, of given length
helpers.createRandomString = len =>{
    len = typeof(len) == 'number' && len > 0 ? len : false;
    if(len){
        // Define all  the possble characters that could g inti a string
        let possibleChars = 'qwertyuiopasdfghjklzxcvbnm1234567890';
        let str ='';
        for(let i=1;i<=len;i++){
            // Get a randome character from the possibleCHars String
            let randomChar = possibleChars.charAt(Math.floor(Math.random()*possibleChars.length));
            // Append this char to finall sring
            str+= randomChar;
        }
        return str;
    }
    else return false;
}


module.exports = helpers;