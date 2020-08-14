


// Defining Routes

const handler = require('./handler');



var router = {
    'users':handler.users,
    'tokens':handler.tokens
}


module.exports = router