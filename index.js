

// Dependencies
var http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const router = require('./lib/router');
const handler = require('./lib/handler');

// const config = {port:3000,envName:"Staging"}


// The Server
var server = http.createServer(function(req,res){

    // Get the URL and Parse it
    debugger;
    var parsedUrl = url.parse(req.url,true);
    


    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');
    console.log("trimmedPath = ",trimmedPath);
    
    // Get QueryStirng Parameter
    var queryStringObject = parsedUrl.query;
    console.log("QueryString = ",queryStringObject );

    // Get HTTP Method
    console.log('Request Method  = ',req.method);
    
    // Get the headers
    console.log("Headers  = ",req.headers);



    // Get the Payload, If any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data',function(data){
        buffer+= decoder.write(data);
    });
    
    req.on("end",function(){
        buffer += decoder.end();
        console.log("Payload Buffer = ",);
        // Send the response 
        
        debugger;

        var data = {
            headers:req.headers,
            method:req.method,
            query:queryStringObject,
            path:trimmedPath,
            payload:buffer
        }


        var chosenHandler = router[trimmedPath] !== undefined ? router[trimmedPath]:handler.notFound;
        chosenHandler(data,function(statusCode,payload){
            statusCode = typeof(statusCode) !== "number" ? 200:statusCode;
            payload = typeof(payload) !== 'object' ?{}:payload;
            res.setHeader("Content-Type","application/json")
            res.writeHead(statusCode);
            res.end(JSON.stringify(payload));
        })



        // Log the requrst path
        console.log('Request is received Wih this payload ',buffer);
    });




});



// Start the Server
server.listen(config.port,function(){
    console.log("The Server is listening at port "+config.port+" and Environment is "+config.envName);
});





// fOR  Routing AND Handling 
//  See router.js and handler.js





