const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../services/authentication');
const checkAdmin = require('../services/checkAdmin');
const currentDate = require('../services/currentDate');
const checkPremium = require('../services/checkPremium');
require('dotenv').config();

router.get('/signup',(request,response) => {
    response.render('signup',{ message: request.query.message });
});

router.post('/signup',(request,response) => {
    let user = request.body;
    var query = "select user_id from user where email=?";
    connection.query(query,[user.email],(error,results)=>{
        if(!error) {
            if(results.length <= 0) {
                query = "insert into user(first_name,last_name,email,password,admin,non_premium,premium) values(?,?,?,?,0,1,0)";
                connection.query(query,[user.first_name,user.last_name,user.email,user.password],(error,resultls) => {
                    if(!error) {
                        var message = "Register Successful. Please login.";
                        response.redirect(`/user/login?message=${encodeURIComponent(message)}`);
                    } else {
                        var message = "Something went wrong. Please try again.";
                        response.redirect(`/user/signup?message=${encodeURIComponent(message)}`);
                    }
                });
            } else {
                var message = "Email already exists.";
                response.redirect(`/user/signup?message=${encodeURIComponent(message)}`);
            }
        } else {
            var message = "Something went wrong. Please try again.";
            response.redirect(`/user/signup?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/login',(request,response) => {
    response.render('login',{ message: request.query.message });
});

router.post('/login',(request,response) => {
    let user = request.body;
    var query = "select user_id,email,password from user where email=?";
    connection.query(query,[user.email],(error,results) => {
        if(!error) {
            if (results.length <= 0 || results[0].password!=user.password) {
                var message = "Incorrect email or password.";
                response.redirect(`/user/login?message=${encodeURIComponent(message)}`);
            } else if(results[0].password==user.password) {
                const user = {
                    user_id: results[0].user_id,
                    email: results[0].email
                  };
                const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'8h'});
                response.cookie('token', accessToken, { httpOnly: true });
                response.redirect('/user/dashboard');
            } else {
                var message = "Something went wrong. Please try again.";
                response.redirect(`/user/login?message=${encodeURIComponent(message)}`);
            }
        } else {
            var message = "Something went wrong. Please try again.";
            response.redirect(`/user/login?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/dashboard',auth.authenticateToken,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/post/get?message=${encodeURIComponent(message)}`);
});

router.get('/plants',auth.authenticateToken,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/plant/get?message=${encodeURIComponent(message)}`);
});

router.get('/events',auth.authenticateToken,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/event/get?message=${encodeURIComponent(message)}`);
});

router.get('/profile',auth.authenticateToken,(request,response,next) => {
    const user_id = request.user.user_id;
    var query = `select * from user where user_id=${user_id}`;
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('profile',{ message: request.query.message, user_info: results });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/my-plants',auth.authenticateToken,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/plant/my-plants?message=${encodeURIComponent(message)}`)
});

router.get('/update-profile',auth.authenticateToken,(request,response,next)=>{
    const user_id = request.user.user_id;
    var query = `select * from user where user_id=${user_id}`;
    connection.query(query,(error,results)=>{
        if(!error){
            response.render('update-profile',{ message: request.query.message, user_info: results });// new view
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/update-profile',auth.authenticateToken,(request,response,next)=>{
    const user = request.body;
    const user_id = request.user.user_id;
    const updatedValues = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_no: user.phone_no,
        birth_date: user.birth_date
    };
    var query = `update user set ? where user_id=${user_id}`;
    connection.query(query,[updatedValues],(error,results)=>{
        if(!error){
            var message = "Profile updated successfully.";
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/change-password',auth.authenticateToken,(request,response,next)=>{
    response.render('change-password',{ message: request.query.message });//new view
});

router.post('/change-password',auth.authenticateToken,(request,response,next)=>{
    let user = request.body;
    let user_id = request.user.user_id;
    var query = `select password from user where user_id=${user_id}`;
    connection.query(query,(error,results)=>{
        if(!error) {
            if (results.length <= 0 || results[0].password!=user.previous_password) {
                var message = "Incorrect previous password.";
                response.redirect(`/user/change-password?message=${encodeURIComponent(message)}`);
            } else if(results[0].password==user.previous_password) {
                query = `update user set password=? where user_id=${user_id}`;
                connection.query(query,[user.new_password],(error,results)=>{
                    if(!error) {
                        var message = "Password updated succesfully.";
                        response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
                    }else {
                        var message = "Something went wrong. Please try again.";
                        response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
                    }
                });
            } else {
                var message = "Something went wrong. Please try again.";
                response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
            }
        } else {
            var message = "Something went wrong. Please try again.";
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/request-premium',auth.authenticateToken,(request,response,next)=>{
    response.render('request-premium',{message: request.query.message });// new view
});

router.post('/request-premium',auth.authenticateToken,(request,response,next)=>{
    const user_id = request.user.user_id;
    const payment_info = request.body;
    const current_date = currentDate.currentDate();
    var query = `insert into payment(card_no,pin,payment_date,status,general_user_id) values(?,?,'${current_date}',0,${user_id})`;
    connection.query(query,[payment_info.card_no,payment_info.pin],(error,results)=>{
        if(!error){
            var message = "Request for premium has been sent. Your request will be approved within 30 minutes. Please be patient.";
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again.";
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/logout',auth.authenticateToken,(request, response) => {
    response.clearCookie('token');
    var message = "Logout successful."
    response.redirect(`/user/login?message=${encodeURIComponent(message)}`);
});

router.get('/logout',auth.authenticateToken,(request, response) => {
    response.clearCookie('token');
    response.redirect('/user/login');// will delete later.
});

//Premium User Controllers
router.get('/my-posts',auth.authenticateToken,checkPremium.checkPremium,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/post/my-posts?message=${encodeURIComponent(message)}`)
});

router.get('/add-post',auth.authenticateToken,checkPremium.checkPremium,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/post/add?message=${encodeURIComponent(message)}`);
});

//Admin User Controller
// router.get('/get',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=> {
//     var query = "select * from user where non_premium=1 order by user_id desc";
//     connection.query(query,(error,results)=> {
//         if(!error) {
//             response.render('all-users',{results});// new view
//         } else {
//             var message = "Something went wrong.";
//             response.render('dashboard',{ message });
//         }
//     });
// });

router.get('/premium-queue',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    var query = "select * from payment where status=0";
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('premium-queue',{ results });// new view
        } else {
            var message = "Something went wrong.";
            response.render('premium-queue',{ message });// new view
        }
    });
});

router.post('/approve-premium/:user_id',auth.authenticateToken,checkAdmin.checkAdmin,(request,response)=>{
    const user_id = request.params.user_id;
    console.log(user_id);
    var query = `update user set premium=1 where user_id=${user_id}`;
    connection.query(query,(error,results)=>{
        if(!error) {
            var message = "User updated to premium.";
            response.render('premium-queue',{ message });// new view
        } else {
            var message = "Something went wrong.";
            response.render('premium-queue',{ message });// new view
        }
    });
});

// optional
// router.get('/', (req, res) => {
//     res.render('index', { alertMessage: req.query.alertMessage });
//   });
  
//   router.get('/redirect', (req, res) => {
//     const alertMessage = 'This is an alert message!';
//     res.redirect(`/user/redirected?alertMessage=${encodeURIComponent(alertMessage)}`);
//   });
  
//   router.get('/redirected', (req, res) => {
//     res.render('redirected', { alertMessage: req.query.alertMessage });
//   });

module.exports = router;