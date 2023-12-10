const express = require('express');
const connection = require('../connection');
const auth = require('../services/authentication');
const checkAdmin = require('../services/checkAdmin');
const checkPremium = require('../services/checkPremium');
const checkNonPremium = require('../services/checkNonPremium');
const formattedDate = require('../services/formattedDate');
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
    var query = "select event_id,title,start_date,end_date,location from event order by event_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            const current_date = new Date();
            response.render('events',{ message: request.query.message,
                                    events: results,
                                    formattedDate: formattedDate.formattedDate,
                                    current_date: current_date,
                                    premium: premium});
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/profile/:event_id',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const premium = request.user.premium;
    const event_id = request.params.event_id;
    var query = "Select * from event where event_id=?";
    connection.query(query,[event_id],(error,results)=>{
        if(!error) {
            const user_id = request.user.user_id;
            query = "select * from user_register_event where general_user_id=? and event_id=?";
            connection.query(query,[user_id,event_id],(error,events)=>{
                if(!error){
                    query = "select * from participation inner join user on user.user_id=participation.general_user_id where participation.event_id=?";
                    connection.query(query,[event_id],(error,participations)=>{
                        if(!error){
                            var registered = 0;
                            var event_happening = 0;
                            var event_started = 0;
                            const current_date = new Date();
                            if(events.length > 0) { registered = 1; }
                            if(results[0].start_date<current_date) {event_started = 1;}
                            if(results[0].start_date<current_date && results[0].end_date>current_date) {event_happening = 1};
                            response.render('event-profile',{ message: request.query.message, 
                                                            event_info: results[0],
                                                            participations: participations,
                                                            formattedDate: formattedDate.formattedDate,
                                                            event_started: event_started,
                                                            event_happening: event_happening,
                                                            registered: registered,
                                                            premium: premium });
                        } else {
                            var message = "Something went wrong. Please try again."
                            response.redirect(`/user/events?message=${encodeURIComponent(message)}`);
                        }
                    });
                } else {
                    var message = "Something went wrong. Please try again."
                    response.redirect(`/user/events?message=${encodeURIComponent(message)}`);
                }
            });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/events?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/register/:event_id',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
     const user_id = request.user.user_id;
     const event_id = request.params.event_id;
     var query = "insert into user_register_event(general_user_id,event_id) values(?,?)";
     connection.query(query,[user_id,event_id],(error,results)=>{
        if(!error) {
            response.redirect(`/event/profile/${event_id}?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again.";
            response.redirect(`/event/profile/${event_id}?message=${encodeURIComponent(message)}`);
        }
     });
});

router.get('/participate/:event_id',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const premium = request.user.premium;
    const event_id = request.params.event_id;
    response.render('participate-form',{ message: request.query.message, event_id: event_id, premium: premium });
});

router.post('/participate/:event_id',auth.authenticateToken,checkNonPremium.checkNonPremium,upload.single('image'),(request,response,next)=>{
    const user_id = request.user.user_id;
    const event_id = request.params.event_id;
    const body = request.body;
    const image = request.file.filename;
    const current_date = new Date();
    var query = "insert into participation(plant_name,image,status,date,general_user_id,event_id) values(?,?,0,?,?,?)";
    connection.query(query,[body.plant_name,image,current_date,user_id,event_id],(error,results)=>{
        if(!error) {
            var message = "Please wait for admin approval to showcase your plantation.";
            response.redirect(`/event/profile/${event_id}?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again.";
            response.redirect(`/event/profile/${event_id}?message=${encodeURIComponent(message)}`);
        }
    });
});

//Admin User Controllers
router.get('/all-events',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    const user_id = request.user.user_id;
    const body = request.query;
    var query = "select * from user where user_id=?";
    connection.query(query,[user_id],(error,results)=>{
        if(!error) {
            if(body.search==undefined || body.search=="") {
                query = "select * from event";
            }else {
                query = `select * from event where event_id like '%${body.search}%' or title like '%${body.search}%'`;
            }
            connection.query(query,(error,events)=>{
                if(!error) {
                    return response.render('all-events',{ message: request.query.message, user_info: results[0], events: events, formattedDate: formattedDate.formattedDate });
                } else {
                    var message = "Something went wrong. Please try again.";
                    return response.redirect(`/plant/all-plants?mesage?=${encodeURIComponent(message)}`);
                }
            });
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/plant/all-plants?mesage?=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/add',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    response.render('add-event',{ message: request.query.message });
});

router.post('/add',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    const user_id = request.user.user_id;
    let event = request.body;
    var query = "insert into event (start_date,end_date,location,title,description,admin_user_id) values (?,?,?,?,?,?)";
    connection.query(query,[event.start_date,event.end_date,event.location,event.title,event.description,user_id],(error,results)=>{
        if(!error) {
            var message = "Event added successfully."
            return response.redirect(`/event/all-events?message=${message}`)
        } else {
            var message = "Something went wrong. Please try again later."
            return response.redirect(`/event/all-events?message=${message}`)
        }
    });
});

router.post('/delete/:event_id',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    const event_id = request.params.event_id;
    var query = "delete from participation where event_id=?";
    connection.query(query,[event_id],(error,results)=>{
        if(!error) {
            query = "delete from user_register_event where event_id=?";
            connection.query(query,[event_id],(error,results)=>{
                if(!error) {
                    query = "delete from event where event_id=?";
                    connection.query(query,[event_id],(error,results)=>{
                        if(!error) {
                            var message = "Event Delete successfully.";
                            return response.redirect(`/event/all-events?message=${encodeURIComponent(message)}`);
                        } else {
                            var message = "Something went wrong. Please try again.";
                            return response.redirect(`/event/all-events?message=${encodeURIComponent(message)}`);
                        }
                    });
                } else {
                    var message = "Something went wrong. Please try again.";
                    return response.redirect(`/event/all-events?message=${encodeURIComponent(message)}`);
                }
            })
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/event/all-events?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/participation-queue',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    const user_id = request.user.user_id;
    var query = "select * from user where user_id=?";
    connection.query(query,[user_id],(error,results)=>{
        if(!error){
            if(request.query.search==undefined || request.query.search==""){
                query = "select * from participation where status=0";
            } else {
                query = `select * from (select * from participation where status=0) L1 where L1.participation_id like '%${request.query.search}' or L1.plant_name like '%${request.query.search}' or L1.date like '%${request.query.search}' or L1.general_user_id like '%${request.query.search}' or L1.event_id like '%${request.query.search}'`
            }
            connection.query(query,(error,participations)=>{
                if(!error) {
                    return response.render('participation-queue',{message: request.query.message, user_info: results[0], participations: participations, formattedDate: formattedDate.formattedDate})
                } else {
                    var message = "Something went wrong. Please tr again.";
                    return response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
                }
            })
        }else{
            var message = "Something went wrong. Please tr again.";
            return response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/approve-participation/:participation_id',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    const participation_id = request.params.participation_id;
    var query = "update participation set status=1 where participation_id=?";
    connection.query(query,[participation_id],(error,results)=>{
        if(!error){
            var message = "Participation approved successfully.";
            return response.redirect(`/event/participation-queue?message=${encodeURIComponent(message)}`)
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/event/participation-queue?message=${encodeURIComponent(message)}`)
        }
    });
});

module.exports = router;