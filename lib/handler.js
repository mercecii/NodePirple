
// For Handling Routes

const _data = require('./data');
const helpers = require('./helpers');





var handler = {};
handler.users = function(data,callback){
    var acceptableMethods = ['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handler._users[data.method](data,callback);
    }
    else{
        callback(405); // Method Not Allowed
    }
};

// COnatiner for the users submethds
handler._users = {};

// Users - POST
// Required data : firstName, lastName, phone, password, tosAgreement
handler._users.post = function(data,callback){
    var firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure that user doesn't already exist
        _data.read('users',phone,function(err,data){
            // If there was an error reading file , it means there was no file , so now new file can be created
            if(err){
                var hashedPassword = helpers.hash(password);
                if(hashedPassword){
                    // Create USer Object
                    var userObject = {
                        firstName : firstName,
                        lastName : lastName,
                        phone : phone,
                        hashedPassword : hashedPassword,
                        tosAgreement : tosAgreement
                    }
                    _data.create('users',phone,userObject,function(err){
                        if(!err){
                            callback(201);
                        }
                        else{
                            console.log(err);
                            callback(500,{"Error":"A USer with the phone NUmber already exists."})
                        }
                    });
                }
                else{
                    callback(500,{"Error":'Could not hash user\'s password.'});
                }
            }
            else{
                callback(400,{"Error":"A User with this phone number already Exists."});
            }
        });
    }
    
}

// Users - GET
handler._users.get = function(data,callback){

}

// Users - PUT
handler._users.put = function(data,callback){
    
}

// Users - DELETE
handler._users.delete = function(data,callback){

}










handler.sample = function(data,callback){
    // Do Something
    callback(200,{route:"Sample HAnder"});

}

handler.notFound = function(data,callback){
    callback(404);
}

handler.addThree = function(data,callback){
    var reqData = JSON.parse(data.payload);
    console.log("reqData  = ",reqData);
    reqData.three = "three";
    callback(201,reqData);
}

handler.hello = function(data,callback){
    callback(200,{
        message:"Hi , Sir I don't know how to get in touch with faculties, Kindly help me on 9572712747@gmail.com",
        email:'d9572712747@gmail.com'
    });
}

handler.create = function(data,callback){
    _data.create("test","newfile",JSON.parse(data.payload),function(err){
        if(!err) callback(201,{"message":"The File is Created"});
        else callback(403,{"Error":err});
    });
}

handler.read = function(data,callback){
    _data.read('test','newfile',function(err,data){
        if(!err){
            let parsedObj = JSON.parse(data);
            callback(200,parsedObj);
        }
        else callback(500,{"Error":err});
    });
}

handler.update = function(data,callback){
    var reqData = JSON.parse(data.payload);
    _data.update('test','newfile',reqData,function(err){
        if(!err){
            callback(200,{"Message":"File Updated"});
        }
        else callback(500,{"Error":err});
    })
}

handler.delete = function(data,callback){
    _data.delete('test','newfile',function(err){
        if(!err){
            callback(200,{"Message":"File Deleted SuccesFully"});
        }
        else{
            callback(404,{"Error":err});
        }
    })
}


module.exports = handler;