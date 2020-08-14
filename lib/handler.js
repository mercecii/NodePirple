
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
        // Get the token from the headers
        let tokenId = typeof(data.headers.token)=='string' ? data.headers.token:false;
        // Verify thhat the given token is valid for the phone number
        handler._tokens.verifyToken(tokenId,phone,function(tokenIsValid){
            if(tokenIsValid){
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
                callback(403,{"Error":"Missing Required token in header , or token is Invalid."});
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
        // Get the token from the headers
        let tokenId = typeof(data.headers.token)=='string' ? data.headers.token:false;
        // Verify thhat the given token is valid for the phone number
        handler._tokens.verifyToken(tokenId,phone,function(tokenIsValid){
            if(tokenIsValid){
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
                callback(403,{"Error":"Missing Required token in header , or token is Invalid."});
        }); 
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
        // Get the token from the headers
        let tokenId = typeof(data.headers.token)=='string' ? data.headers.token:false;
        // Verify thhat the given token is valid for the phone number
        handler._tokens.verifyToken(tokenId,phone,function(tokenIsValid){
            if(tokenIsValid){
                _data.read('users',phone,function(err,userData){
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
                callback(403,{"Error":"Missing Required token in header , or token is Invalid."});
        });



        



        
    }
    else
        callback(400,{"Error":"Phone Number is Mandatory for Delete"});
}


handler.tokens = function(data,callback){
    let acceptableMethods = ['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handler._tokens[data.method](data,callback);
    }
    else{
        callback(405);// Method Not Allowed
    }
}

handler._tokens = {};

handler._tokens.get = function(data,callback){
    var tokenId = (typeof(data.query.tokenId) == "string" && data.query.tokenId.trim().length==20)?data.query.tokenId.trim():false;
    if(tokenId){
        _data.read('tokens',tokenId,function(err,token){
            if(!err)
                callback(200,token);
            else
                callback(404,{"Error":"token not Found."});
        });
    }
    else
        callback(400,{"Error":"Missing Required Field"});

}

handler._tokens.post = function(data,callback){
    let phone = typeof(data.payload.phone)== 'string' && data.payload.phone.trim().length==10 ? data.payload.phone.trim():false;
    let password = typeof(data.payload.password)== 'string' && data.payload.password.trim().length>0 ? data.payload.password.trim():false;
    if(phone && password){
        _data.read('users',phone,function(err,userData){
            if(!err && userData){
                if(userData.hashedPassword === helpers.hash(password)){
                    // if valid , create a new token with a randim name . set Expiration date 1 hour later
                    let tokenId = helpers.createRandomString(20);

                    let expires = Date.now()+ 1000 *3600; // one hour 
                    let token = {phone,tokenId,expires};
                    // Store the token
                    _data.create('tokens',tokenId,token,err=>{
                        if(!err) callback(201,token);
                        else callback(500,{'Error':'Could not create a new token'});
                    });

                }
                else callback(400,{"Error":"Password did not match"});
            }
            else callback(404,{"Error":'COuld not find the specified user.'});
        });
    }
    else callback(400,{"Error":"Missing Required fields"});
}

handler._tokens.put = function(data,callback){

    let id = typeof(data.payload.tokenId)=='string' && data.payload.tokenId.trim().length ==20  ?data.payload.tokenId.trim():false;
    let extend = typeof(data.payload.extend)=='boolean' && data.payload.extend==true ?true:false;
    if(id && extend){
        _data.read('tokens',id,function(err,token){
            if(!err && token){
                
                if(token.expires > Date.now()){
                    token.expires = Date.now()+ 1000 * 3600;
                    _data.update('tokens',id,token,function(err){
                        if(!err) callback(200,{"Message":"updates Tokens Successfully"});
                        else callback(500,{"Error":"Could not update Tokens"})
                    });
                }
                else callback(400,{"Error":"Token Already Expired. PLease Login Again"})
            }
            else callback(400,{"Error":"Specified Token does o exists."})
        });
    }
    else callback(400,{"Error":"Missing Required Fields."});



}

handler._tokens.delete = function(data,callback){
    var tokenId = typeof(data.query.tokenId)== 'string' && data.query.tokenId.trim().length==20 ? data.query.tokenId.trim():false;
    if(tokenId){
        _data.read('tokens',tokenId,function(err,token){
            if(!err && token){
                _data.delete('tokens',tokenId,function(err){
                    if(!err){
                        callback(200,{"Message":"Token Successfully deleted."});
                    }
                    else
                        callback(500,{"Error":"Can't Delete Token."});
                });
            }
            else
                callback(400,{"Error":"Toekn Doesn't Exist."});
        });



        
    }
    else
        callback(400,{"Error":"Token is Mandatory for Delete"});
}


// Verify if a given token id is currently valid for a given user
handler._tokens.verifyToken = function(tokenId,phone,callback){
    _data.read('tokens',tokenId,function(err,token){
        if(!err && token){
            if(token.phone==phone && token.expires>Date.now())
                callback(true);
            else 
                callback(false);
        }
        else
            callback(false);
        
        
    });
}





handler.notFound = function(data,callback){
    callback(404);
}




module.exports = handler;