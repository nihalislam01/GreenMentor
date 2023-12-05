const express = require('express');
const connection = require('../connection');
const auth = require('../services/authentication');
var checkAdmin = require('../services/checkAdmin');
const router = express.Router();

router.get('/get',auth.authenticateToken,(request,response,next)=>{
    var query = "select * from event order by event_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('events',{ message: request.query.message, events: results });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/participate',auth.authenticateToken,(request,response,next)=>{
    const requestParam = null;
    const user_id = request.user.user_id;
    const plant_image = request.body;
    if (requestParam!=null) {
        var query = `select start_date,end_date from event where event_id=${requestParam}`;
        connection.query(query,(error,results)=>{
            if (!error) {
                const current_date = null;
                if(current_date>results[0].start_date && current_date<[0].end_date) {
                    query = `insert into user_participate_event(user_id,event_id,image,user_count) values(${user_id},${requestParam},?,0)`;
                    connection.query(query,[plant_image.image],(error,results)=>{
                        if(!error){
                            response.redirect('/user/profile');
                        } else {
                            response.status(500).send(error);// alert something went wrong
                        }
                    });
                } else {
                    response.status(500).send(error);// alert date over
                }
            } else {
                response.status(500).send(error);// alert something went wrong
            }
        });
    } else {
        response.sendStatus(500);// alert something went wrong
    }
});

//Admin User Controllers
router.post('/add',auth.authenticateToken,checkAdmin.checkAdmin,(request,response)=>{
    let event = request.body;
    var query = "insert into event (start_date,end_date,location,admin_user_id) values (?,?,?,?)";
    connection.query(query,[event.start_date,event.end_date,event.location,event.admin_user_id],(error,results)=>{
        if(!error) {
            return response.status(200).json({message: "Event added successfully."});
        } else {
            return response.status(500).json(error);
        }
    });
});

module.exports = router;