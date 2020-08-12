


// Defining Routes

const handler = require('./handler');



var router = {
    'sample':handler.sample,
    'addThree':handler.addThree,
    'hello':handler.hello,
    'createfile':handler.create,
    'readfile':handler.read,
    'updatefile':handler.update,
    'deletefile':handler.delete,
    'users':handler.users
}


module.exports = router