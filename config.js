

var environemnts = {}

environemnts.staging = {
    port:3000,
    envName:"Staging",
    hashingSecret:"AKey"
}
environemnts.production = {
    port:5000,
    envName:"Production",
    hashingSecret:"AnotherKey"
}
 
var currentEnvironment = typeof(process.env.NODE_ENV)=== 'string'? process.env.NODE_ENV.toLowerCase():'';

var environmentToExport = typeof(environemnts[currentEnvironment]) === "object" ? environemnts[currentEnvironment] : environemnts.staging;

module.exports = environmentToExport;

