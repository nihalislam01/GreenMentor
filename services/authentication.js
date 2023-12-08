require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(request,response,next){
    const token = request.cookies.token;
    if(token == null) 
        return response.redirect(`/user/login?message=${encodeURIComponent("Please login.")}`);

    jwt.verify(token,process.env.ACCESS_TOKEN,(err,res)=>{
        if(err)
        return response.redirect(`/user/login?message=${encodeURIComponent("Please login.")}`);
        response.locals = res;
        request.user = res;
        next();
    });
}

module.exports = { authenticateToken: authenticateToken }