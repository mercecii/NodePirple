

const fs = require('fs');
const path = require('path');

// This file is about CURD Operations


var lib = {};
lib.baseDir = path.join(__dirname,'/../.data/'); // __dirname represents this files location


lib.create = function(dir,file,data,callback){
    var fileUrl = lib.baseDir+dir+'/'+file+'.json';
    fs.open(fileUrl,'wx',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            var stringData = JSON.stringify(data);
            //  Write to file and close it
            fs.writeFile(fileDescriptor,stringData,function(err){
                if(!err){
                    //  close the file
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            // Returning false ,as there were no Errors.ANd this is Error back pattern.
                            callback(false);
                        }
                        else
                            callback("Error Closing File");
                    });
                }
                else
                    callback("Error in Writing to New File");
            });
        }
        else
            callback("Couldn't Create New File , It may already exist.");
    })

}



lib.update = function(dir,file,data,callback){
    var fileUrl = this.baseDir + dir + '/' + file + '.json';
    fs.open(fileUrl,'r+',function(err,fileDescriptor){
        if(!err){
            
            fs.ftruncate(fileDescriptor,function(err){
                if(!err){
                    var stringData = JSON.stringify(data);
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err)
                                    callback(false);
                                else callback("Error Closing FFile");
                            });
                        }
                        else callback("Error Writing File");
                    });
                }
                else callback("Error Truncating file");
            });
        }
        else callback("Error in opening file : The file doesn't exists");
    });
}



lib.read = function(dir,file,callback){
    var fileUrl = this.baseDir + dir + '/' + file + '.json';

    fs.readFile(fileUrl,function(err,data){
        callback(err,data);
    });
}



lib.delete = function(dir,file,callback){
    var fileUrl = this.baseDir + dir + '/' + file + '.json';
    fs.unlink(fileUrl,function(err){
        if(!err){
            callback(false);
        }
        else{
            callback(err);
        }
    });
}



module.exports  = lib;