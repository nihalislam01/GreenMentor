const express = require('express');
const connection = require('../connection');
const router = express.Router();

router.post('/signup',(request,response) => {
    let user = request.body;
    query = "select email,password,admin,non_premium,premium from user where email=?";
    connection.query(query,[user.email],(error,results)=>{
        if(!error) {
            if(results.length <= 0) {
                query = "insert into user(first_name,last_name,email,password,admin,non_premium,premium) values(?,?,?,?,0,1,0)";
                connection.query(query,[user.first_name,user.last_name,user.email,user.password],(error,resultls) => {
                    if(!error) {
                        return response.status(200).json({message: "Successfully Registered"});
                    } else {
                        return response.status(500).json(error);
                    }
                });
            } else {
                return response.status(400).json({message: "Email Already Exists."});
            }
        } else {
            return response.status(500).json(error);
        }
    });
});

router.post('/login',(request,response) => {
    let user = request.body;
    query = "select email,password,admin,non_premium,premium from user where email=?";
    connection.query(query,[user.email],(error,results) => {
        if(!error) {
            if (results.length <= 0 || results[0].password!=user.password) {
                return response.status(401).json({message: "Incorrect username or password."});
            } else if(results[0].password==user.password) {
                return response.status(200).json({message: "Login Successful."});
            } else {
                return response.status(400).json({message: "Something went wrong. Please try again."});
            }
        } else {
            return response.status(500).json(error);
        }
    });
});

module.exports = router;