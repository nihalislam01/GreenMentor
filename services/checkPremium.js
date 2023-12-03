require('dotenv').config();

function checkPremium(request, response, next) {
    if(response.locals.premium == 0)
        response.sendStatus(401)
    else
        next()
}

module.exports = { checkPremium: checkPremium }