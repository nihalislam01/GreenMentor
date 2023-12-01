const express = require('express');
const connection = require('../connection');
const router = express.Router();

router.post('/add',(request,response)=>{
    let post = request.body;
    var query = "insert into post (description,premium_user_id) values (?,?)";
    connection.query(query,[post.description,post.premium_user_id],(error,results)=>{
        if(!error) {
            return response.status(200).json({message: "Post added successfully."});
        } else {
            return response.status(500).json(error);
        }
    });
});

router.get('/get',(request,response)=>{
    let user = response.locals.body;
    var query = "select * from post order by post_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            console.log(user);
            return response.status(200).json(results);
        } else {
            return response.status(500).json(error);
        }
    });
});

module.exports = router;