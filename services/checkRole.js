require('dotenv').config();

function checkRole(request, response, next) {
    if(response.locals.non_premium == 1) {
        response.sendStatus(401)
    }
    else {
        next()
    }
}

module.exports = { checkRole:checkRole }