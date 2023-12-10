require('dotenv').config();

function checkNonPremium(request, response, next) {
    if(response.locals.admin == 1)
        response.redirect(`/user/dashboard?message=${encodeURIComponent("You're not athorized to view this page.")}`);
    else
        next()
}

module.exports = { checkNonPremium: checkNonPremium }