
// For Handling Routes

const _data = require('./data');

const helpers = require('./helpers');
const { parse } = require('path');





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
                    var userObject = {
                        "firstName" : firstName,
                        "lastName" : lastName,
                        "phone" : phone,
                        "hashedPassword" : hashedPassword,
                        "tosAgreement" : tosAgreement
                    }
                    console.trace();
                    _data.create('users',phone,userObject,function(err){
                        if(!err)
                            callback(201);
                        else{
                            console.log(err);
                            callback(500,{"Error":"A USer with the phone Number already exists."})
                        }
                    });
                }
                else
                    callback(500,{"Error":'Could not hash user\'s password.'});
            }
            else
                callback(400,{"Error":"A User with this phone number already Exists."});
        });
    }
    else
        callback(400,{"Error":"Missing Required Fields."});
    
}

// Users - GET
handler._users.get = function(data,callback){
    var phone = (typeof(data.query.phone) == "string" && data.query.phone.trim().length==10)?data.query.phone.trim():false;
    if(phone){
        console.trace();
        _data.read('users',phone,function(err,jsonData){
            if(!err){
                delete jsonData.hashedPassword;
                callback(200,jsonData);
            }
            else
                callback(404,{"Error":"User not Found."});
        });
    }
    else
        callback(400,{"Error":"Missing Required Field"});
}

// Users - PUT
handler._users.put = function(data,callback){
    // Check for required field.
    var phone = typeof(data.payload.phone)== 'string' && data.payload.phone.trim().length==10 ? data.payload.phone.trim():false;
    // Check for option fields
    var firstName = typeof(data.payload.firstName)=='string' && data.payload.firstName.trim().length>0 ? data.payload.firstName.trim():false;
    var lastName = typeof(data.payload.lastName)=='string' && data.payload.lastName.trim().length>0 ? data.payload.lastName.trim():false;
    var password = typeof(data.payload.password)=='string' && data.payload.password.trim().length>0 ? data.payload.password.trim():false;

    
    if(phone){
        // Error if nothing is sent to update
        if(firstName || lastName || password){
            _data.read('users',phone,function(err,userData){
                if(!err && userData){
                    if(firstName)
                        userData.firstName = firstName;
                    if(lastName)
                        userData.lastName = lastName;
                    if(password)
                        userData.hashedPassword = helpers.hash(password); 

                    _data.update('users',phone,userData,function(err){
                        if(!err){
                            callback(200,{"Message":"Successfully Updated."});
                        }
                        else
                            callback(500,{"Error":"Can't Update User Data."});
                    });
                }
                else
                    callback(400,{"Error":"User with Phone Number: "+phone+" ,Doesn't Exist."});
            });
        }
    }
    else
        callback(400,{"Error":"Phone Number is Mandatory for Update"});
}

// Users - DELETE
// Only an Athenticated USer can delete its file, Don't let anyone delete someone else's file
// (CLeanup) Delete files associated with this user
handler._users.delete = function(data,callback){
    var phone = typeof(data.payload.phone)== 'string' && data.payload.phone.trim().length==10 ? data.payload.phone.trim():false;
    if(phone){
        _data.read('users',phoe,function(err,userData){
            if(!err && userData){
                _data.delete('users',phone,function(err){
                    if(!err){
                        callback(200,{"Message":"Uer Successfully deleted."});
                    }
                    else
                        callback(500,{"Error":"Can't Delete User."});
                });
            }
            else
                callback(400,{"Error":"User with Phone Number: "+phone+" ,Doesn't Exist."});
        });



        
    }
    else
        callback(400,{"Error":"Phone Number is Mandatory for Delete"});
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
    if(data.payload.constructor !== ({}).constructor){ // if it is a JSON object
        var payload = helpers.parseJsonObject(data.payload);
    }
    _data.create("test","newfile",payload,function(err){
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