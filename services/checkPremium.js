require('dotenv').config();

function checkPremium(request, response, next) {
    if(response.locals.premium == 0)
        response.redirect(`/user/dashboard?message=${encodeURIComponent("You're not athorized to view this page.")}`);
    else
        next()
}

module.exports = { checkPremium: checkPremium }