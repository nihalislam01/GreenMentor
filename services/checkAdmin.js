require('dotenv').config();

function checkAdmin(request, response, next) {
    if(response.locals.admin == 0)
        response.redirect(`/user/dashboard?message=${encodeURIComponent("You're not athorized to view this page.")}`);
    else
        next()
}

module.exports = { checkAdmin: checkAdmin }