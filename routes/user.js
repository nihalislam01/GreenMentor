const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../services/authentication');
const checkAdmin = require('../services/checkAdmin');
const checkPremium = require('../services/checkPremium');
const checkNonPremium = require('../services/checkNonPremium');
const formattedDate = require('../services/formattedDate');
const currentDate = require('../services/currentDate');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'assets','uploads'),
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
const upload = multer({ storage: storage });

router.get('/signup',(request,response) => {
    response.render('signup',{ message: request.query.message });
});

router.post('/signup',(request,response) => {
    let user = request.body;
    var query = "select user_id from user where email=?";
    connection.query(query,[user.email],(error,results)=>{
        if(!error) {
            if(results.length <= 0) {
                query = "insert into user(first_name,last_name,email,password,birth_date,admin,non_premium,premium) values(?,?,?,?,?,0,1,0)";
                connection.query(query,[user.first_name,user.last_name,user.email,user.password,user.birth_date],(error,resultls) => {
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
    var query = "select user_id,email,password,admin,premium from user where email=?";
    connection.query(query,[user.email],(error,results) => {
        if(!error) {
            if (results.length <= 0 || results[0].password!=user.password) {
                var message = "Incorrect email or password.";
                response.redirect(`/user/login?message=${encodeURIComponent(message)}`);
            } else if(results[0].password==user.password) {
                const user = {
                    user_id: results[0].user_id,
                    email: results[0].email,
                    admin: results[0].admin,
                    premium: results[0].premium
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

router.get('/dashboard',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/post/get?message=${encodeURIComponent(message)}`);
});

router.get('/plants',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/plant/get?message=${encodeURIComponent(message)}`);
});

router.get('/events',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/event/get?message=${encodeURIComponent(message)}`);
});

router.get('/profile',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next) => {
    const premium = request.user.premium;
    const admin = request.user.admin;
    const user_id = request.user.user_id;
    var query = `select * from user where user_id=${user_id}`;
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('profile',{ message: request.query.message, 
                                        user_info: results[0], 
                                        formattedDate: formattedDate.formattedDate, 
                                        premium: premium, 
                                        admin: admin });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/my-plants',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/plant/my-plants?message=${encodeURIComponent(message)}`)
});

router.get('/update-profile',auth.authenticateToken,(request,response,next)=>{
    const premium = request.user.premium;
    const user_id = request.user.user_id;
    var query = "select * from user where user_id=?";
    connection.query(query,[user_id],(error,results)=>{
        if(!error){
            response.render('update-profile',{ message: request.query.message, user_info: results[0], premium: premium });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/update-profile',auth.authenticateToken,upload.single('image'),(request,response,next)=>{
    const user = request.body;
    const user_id = request.user.user_id;
    const image = request.file.filename;
    const updatedValues = {
        image: image,
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
    const premium = request.user.premium;
    response.render('change-password',{ message: request.query.message, premium: premium });
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

router.get('/request-premium',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    response.render('request-premium',{message: request.query.message });
});

router.post('/request-premium',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const user_id = request.user.user_id;
    const payment_info = request.body;
    const current_date = currentDate.currentDate();
    var query = "select * from payment where general_user_id=?";
    connection.query(query,[user_id],(error,results)=>{
        if(!error) {
            if(results.length <= 0) {
                var query = "insert into payment(card_no,pin,payment_date,status,general_user_id) values(?,?,?,0,?)";
                connection.query(query,[payment_info.card_no,payment_info.pin,current_date,user_id],(error,results)=>{
                    if(!error){
                        var message = "Request for premium has been sent. Your request will be approved within 30 minutes. Please be patient.";
                        response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
                    } else {
                        var message = "Something went wrong. Please try again.";
                        response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
                    }
                });
            } else {
                var message = "Please be patient. You request is pending for admin approval.";
                response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
            }
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
router.get('/my-posts',auth.authenticateToken,checkPremium.checkPremium,checkNonPremium.checkNonPremium,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/post/my-posts?message=${encodeURIComponent(message)}`)
});

router.get('/add-post',auth.authenticateToken,checkPremium.checkPremium,checkNonPremium.checkNonPremium,(request,response,next)=>{
    var message = request.query.message;
    response.redirect(`/post/add?message=${encodeURIComponent(message)}`);
});

//Admin User Controller
router.get('/all-users',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=> {
    const user_id = request.user.user_id;
    const body = request.query;
    var query = "select * from user where user_id=?";
    connection.query(query,[user_id],(error,results)=>{
        if(!error) {
            if (body.search==undefined) {
                query = "select * from user where non_premium=1";
            } else {
                query = `select * from (select * from user where non_premium=1) L1 where L1.user_id like '%${body.search}%' or L1.first_name like '%${body.search}%' or L1.last_name like '%${body.search}%' or L1.email like '%${body.search}%'`;
            }
            connection.query(query,(error,users)=> {
                if(!error) {
                    response.render('all-users',{message: message, user_info: results[0], users: users, formattedDate: formattedDate.formattedDate });
                } else {
                    var message = "Something went wrong. Please try again";
                    return response.redirect(`/user/all-plants?message=${encodeURIComponent(message)}`);
                }
            });
        } else {
            var message = "Something went wrong. Please try again";
            return response.redirect(`/user/all-plants?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/delete/:user_id',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    const user_id = request.params.user_id;
    var query = "delete from user where user_id=?";
    connection.query(query,[user_id],(error,results)=>{
        if(!error){
            var message = "User deleted successfully.";
            return response.redirect(`/user/all-users?message=${encodeURIComponent(message)}`);
        }
    })
});

router.get('/premium-queue',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    var query = "select * from payment where status=0";
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('premium-queue',{ results });
        } else {
            var message = "Something went wrong.";
            response.render('premium-queue',{ message });
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

module.exports = router;