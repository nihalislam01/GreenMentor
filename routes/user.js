const express = require('express');
const connection = require('../connection');
const router = express.Router();

router.get('/signup',(request,response) => {
    const message = "Welcome to signup page.";
    response.render('signup',{ message });
});

router.post('/signup',(request,response) => {
    let user = request.body;
    var query = "select email,password,admin,non_premium,premium from user where email=?";
    connection.query(query,[user.email],(error,results)=>{
        if(!error) {
            if(results.length <= 0) {
                query = "insert into user(first_name,last_name,email,password,admin,non_premium,premium) values(?,?,?,?,0,1,0)";
                connection.query(query,[user.first_name,user.last_name,user.email,user.password],(error,resultls) => {
                    if(!error) {
                        const message = "Registered Successfully. Please login."
                        response.render('login',{ message });
                    } else {
                        response.status(500).send(error);
                    }
                });
            } else {
                const message = "Email Already Exists.";
                response.render('signup',{ message });
            }
        } else {
            response.status(500).send(error);
        }
    });
});

router.get('/login',(request,response) => {
    const message = "Welcome to Login page.";
    response.render('login',{ message });
});

router.post('/login',(request,response) => {
    let user = request.body;
    var query = "select email,password,admin,non_premium,premium from user where email=?";
    connection.query(query,[user.email],(error,results) => {
        if(!error) {
            if (results.length <= 0 || results[0].password!=user.password) {
                const message = "Incorrect username or password.";
                response.render('login',{ message });
            } else if(results[0].password==user.password) {
                response.redirect('/plant/get');
            } else {
                response.status(400).send("Something went wrong. Please try again.");
            }
        } else {
            response.status(500).send(error);
        }
    });
});

router.get('/get',(request,response)=> {
    var query = "select * from user where non_premium=1 order by user_id desc";
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
});

router.get('/profile',(request,response) => {
    const user_id = request
    var query = "select * from user where user_id=?"
    response.render('profile');
});

module.exports = router;