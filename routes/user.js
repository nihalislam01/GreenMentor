const { response } = require('express');
const express = require('express');
const connection = require('../connection');
const router = express.Router();

router.post('/signup',(request,response) => {
    let user = request.body;
    var query = "select email,password,admin,non_premium,premium from user where email=?";
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
    var query = "select email,password,admin,non_premium,premium from user where email=?";
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

router.get('/get',(request,response)=> {
    var query = "select user_id,first_name,last_name,email,password from user where non_premium=1";
    connection.query(query,(error,results)=> {
        if(!error) {
            return response.status(200).json(results);
        } else {
            return response.status(500).json(error);
        }
    });
});

router.patch('/update-premium',(request,response)=>{
    let user = request.body;
    var query = "update user set premium=? where id=?";
    connection.query(query,[user.premium,user.id],(error,results)=>{
        if(!error) {
            if(results.affectRows == 0) {
                return response.sendStatus(404).json({message: "User id does not exists."});
            } else {
                return response.status(200).json({message: "User updated successfully."});
            }
        } else {
            return response.status(500).json(error);
        }
    });
});

router.post('/change-password',(request,response)=>{
    let user = request.body;
    var query = "select * from user where email=? and password=?";
    connection.query(query,[user.email,user.previous_password],(error,results)=>{
        if(!error) {
            if (results.length <= 0 || results[0].password!=user.previous_password) {
                return response.status(401).json({message: "Incorrect previous password."});
            } else if(results[0].password==user.previous_password) {
                query = "update user set password=? where email=?";
                connection.query(query,[user.new_password,user.email],(error,results)=>{
                    if(!error) {
                        return response.status(200).json({message: "Password changed successfully."});
                    }else {
                        return response.status(500).json(error);
                    }
                });
            } else {
                return response.status(400).json({message: "Something went wrong. Please try again."});
            }
        } else {
            return response.status(500).json(error);
        }
    });
})

module.exports = router;