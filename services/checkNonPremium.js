require('dotenv').config();

function checkNonPremium(request, response, next) {
    if(response.locals.admin == 1)
        response.sendStatus(401)
    else
        next()
}

module.exports = { checkNonPremium: checkNonPremium }