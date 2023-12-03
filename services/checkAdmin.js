require('dotenv').config();

function checkAdmin(request, response, next) {
    if(response.locals.admin == 0)
        response.sendStatus(401)
    else
        next()
}

module.exports = { checkAdmin: checkAdmin }