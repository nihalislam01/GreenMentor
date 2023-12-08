const express = require('express');
const connection = require('../connection');
const auth = require('../services/authentication');
var checkPremium = require('../services/checkPremium');
const checkNonPremium = require('../services/checkNonPremium');
const formattedDate = require('../services/formattedDate')
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'assets','uploads'),
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
const upload = multer({ storage: storage });

router.get('/get',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const premium = request.user.premium;
    var query = "select post.post_id,post.image as post_image,post.location,post.date,post.likes,post.description,user.first_name,user.image as user_image, user.user_id, user.premium from post inner join user on user.user_id=post.premium_user_id order by post.post_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            return response.render('dashboard',{ message: request.query.message, posts: results, formattedDate: formattedDate.formattedDate, isMine: false, premium: premium });
        } else {
            var message = "Something went wrong. Please try again."
            return response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/like-pressed/:post_id/:user_id',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const post_id = request.params.post_id;
    const user_id = request.params.user_id;
    const current_user_id = request.user.user_id;
    if(parseInt(user_id)==current_user_id){
        return response.redirect("/user/dashboard");
    }
    var query = "select * from user_like_post where user_id=? and post_id=?";
    connection.query(query,[user_id,post_id],(error,results)=>{
        if(!error){
            if(results.length > 0) {
                return response.redirect("/user/dashboard");
            } else {
                var query = "insert into user_like_post(post_id,user_id) values(?,?)";
                connection.query(query,[post_id,user_id],(error,results)=>{
                    if(!error) {
                        var query = "update post set likes=likes+1 where post_id=?";
                        connection.query(query,[post_id],(error,results)=>{
                            if(!error) {
                                return response.redirect("/user/dashboard");
                            } else {
                                var message = "Something went wrong. Please try again."
                                return response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
                            }
                        });
                    } else {
                        var message = "Something went wrong. Please try again."
                        return response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
                    }
                });
            }
        } else {
            var message = "Something went wrong. Please try again."
            return response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
        }
    })
});

//Premium User Controllers
router.get('/my-posts',auth.authenticateToken,checkPremium.checkPremium,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const premium = request.user.premium;
    const user_id = request.user.user_id;
    var query = "select post.post_id,post.image as post_image,post.location,post.date,post.likes,post.description,user.first_name,user.image as user_image, user.user_id from post inner join user on user.user_id=post.premium_user_id where user.user_id=? order by post.post_id desc";
    connection.query(query,[user_id],(error,results)=>{
        if(!error) {
            return response.render('dashboard',{ message: request.query.message, posts: results, formattedDate: formattedDate.formattedDate, isMine: true, premium: premium });
        } else {
            var message = "Something went wrong. Please try again."
            return response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/add',auth.authenticateToken,checkPremium.checkPremium,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const premium = request.user.premium;
    response.render('add-post',{ message: request.query.message, premium: premium });
});

router.post('/add',auth.authenticateToken,checkPremium.checkPremium,checkNonPremium.checkNonPremium,upload.single('image'),(request,response,next)=>{
    let post = request.body;
    let user_id = request.user.user_id;
    const current_date = new Date();
    const image = request.file.filename;
    var query = "insert into post(image,date,description,location,likes,premium_user_id) values (?,?,?,?,0,?)";
    connection.query(query,[image,current_date,post.description,post.location,user_id],(error,results)=>{
        if(!error) {
            var message = "Post added successfully.";
            return response.redirect(`/user/my-posts?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/user/my-posts?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/delete/:post_id',auth.authenticateToken,checkPremium.checkPremium,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const post_id = request.params.post_id;
    var query = "delete from user_like_post where post_id=?";
    connection.query(query,[post_id],(error,results)=>{
        if(!error) {
            var query = "delete from post where post_id=?";
            connection.query(query,[post_id],(error,results)=>{
                if(!error){
                    var message = "Post deleted.";
                    return response.redirect(`/user/my-posts?message=${encodeURIComponent(message)}`);
                }else{
                    var message = "Something went wrong. Please try again.";
                    return response.redirect(`/user/my-posts?message=${encodeURIComponent(message)}`);
                }
            });
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/user/my-posts?message=${encodeURIComponent(message)}`);
        }
    });
});

module.exports = router;