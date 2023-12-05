const express = require('express');
const connection = require('../connection');
const auth = require('../services/authentication');
var checkPremium = require('../services/checkPremium');
const router = express.Router();

router.get('/get',auth.authenticateToken,(request,response,next)=>{
    var query = "select * from post order by post_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('dashboard',{ message: request.query.message, posts: results });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

//Premium User Controllers
router.get('/my-posts',auth.authenticateToken,checkPremium.checkPremium,(request,response,next)=>{
    const user_id = request.user.user_id;
    var query = `select * from post where premium_user_id=${user_id} order by post_id desc`;
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('my-posts',{ message: request.query.message, posts: results });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/add',auth.authenticateToken,checkPremium.checkPremium,(request,response,next)=>{
    response.render('add-post',{ message: request.query.message});// new view
});

router.post('/add',auth.authenticateToken,checkPremium.checkPremium,(request,response,next)=>{
    let post = request.body;
    let user_id = request.user.user_id;
    var query = `insert into post (image,description,premium_user_id) values (?,?,${user_id})`;
    connection.query(query,[post.image,post.description],(error,results)=>{
        if(!error) {
            var message = "Post added successfully.";
            response.redirect(`/user/my-posts?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again.";
            response.redirect(`/user/my-posts?message=${encodeURIComponent(message)}`);
        }
    });
});

module.exports = router;