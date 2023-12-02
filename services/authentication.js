require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(request,response,next){
    const token = request.cookies.token;
    if(token == null)
        return response.sendStatus(401);

    jwt.verify(token,process.env.ACCESS_TOKEN,(err,res)=>{
        if(err)
            return response.sendStatus(403);
        response.locals = res;
        request.user = res;
        next();
    });
}

module.exports = { authenticateToken: authenticateToken }