const express = require('express');
const connection = require('../connection');
var auth = require('../services/authentication');
var checkAdmin = require('../services/checkAdmin');
var checkPremium = require('../services/checkPremium');
const checkNonPremium = require('../services/checkNonPremium');
const formattedDate = require('../services/formattedDate');
const router = express.Router();

router.get('/get',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const premium = request.user.premium;
    var query = "select plant_id,name,image_url from plant order by plant_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('plants',{ message: request.query.message, plants: results, premium: premium });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/plant-profile/:plant_id',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const premium = request.user.premium;
    const plant_id = request.params.plant_id;
    const user_id = request.user.user_id;
    var query = "select * from plant where plant_id=?";
    connection.query(query,[plant_id],(error,results)=>{
        if(!error){
            query = "select * from sunlight where plant_id=?";
            connection.query(query,[plant_id],(error,sunlight)=>{
                if(!error) {
                    query = "select * from user_add_plant where general_user_id=? and plant_id=?"
                    connection.query(query,[user_id,plant_id],(error,exists)=>{
                        if (!error) {
                            if(exists.length > 0) {
                                return response.render('plant-profile',{ message: request.query.message, plant_info: results[0], premium: premium, sunlight: sunlight, isMine: true });
                            } else {
                                return response.render('plant-profile',{ message: request.query.message, plant_info: results[0], premium: premium, sunlight: sunlight, isMine: false });
                            }
                        } else {
                            var message = "Something went wrong. Please try again."
                            return response.redirect(`/user/plants?message=${encodeURIComponent(message)}`);
                        }
                    });
                } else {
                    var message = "Something went wrong. Please try again."
                    return response.redirect(`/user/plants?message=${encodeURIComponent(message)}`);
                }
            });
        } else {
            var message = "Something went wrong. Please try again."
            return response.redirect(`/user/plants?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/my-plants',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const premium = request.user.premium;
    const user_id = request.user.user_id;
    var query = `select * from user_add_plant inner join plant on plant.plant_id=user_add_plant.plant_id where user_add_plant.general_user_id=${user_id}`;
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('plants',{ message: request.query.message, plants: results, premium: premium });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/add-to-profile/:plant_id',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const plant_id = request.params.plant_id;
    const user_id = request.user.user_id;
    var query = "insert into user_add_plant(general_user_id,plant_id) values(?,?)";
    connection.query(query,[user_id,plant_id],(error,results)=>{
        if(!error){
            var message = "Plant added to profile successfully."
            return response.redirect(`/plant/plant-profile/${plant_id}?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/plant/plant-profile/${plant_id}?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/add-to-profile/:plant_id',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const plant_id = request.params.plant_id;
    const user_id = request.user.user_id;
    var query = "insert into user_add_plant(general_user_id,plant_id) values(?,?)";
    connection.query(query,[user_id,plant_id],(error,results)=>{
        if(!error){
            var message = "Plant added to profile successfully."
            return response.redirect(`/plant/plant-profile/${plant_id}?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/plant/plant-profile/${plant_id}?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/remove/:plant_id',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const plant_id = request.params.plant_id;
    const user_id = request.user.user_id;
    var query = "delete from user_add_plant where plant_id=? and general_user_id=?";
    connection.query(query,[plant_id,user_id],(error,results)=>{
        if(!error){ 
            var message = "Plant removed from profile successfully.";
            return response.redirect(`/plant/plant-profile/${plant_id}?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/plant/plant-profile/${plant_id}?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/search',auth.authenticateToken,checkNonPremium.checkNonPremium,(request,response,next)=>{
    const premium = request.user.premium;
    const body = request.body;
    var query = `select * from plant where name like '%${body.query}%' order by plant_id desc`;
    connection.query(query,(error,results)=>{
        if(!error){
            response.render('plants',{ message: request.query.message, plants: results, premium: premium });
        } else {
            var message = "Something went wrong. Please try again.";
            response.redirect(`/user/plants?message=${encodeURIComponent(message)}`);
        }
    });
});

//Admin User Controllers
router.get('/all-plants',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    const user_id = request.user.user_id;
    const body = request.query;
    var query = "select * from user where user_id=?";
    connection.query(query,[user_id],(error,results)=>{
        if(!error) {
            if(body.search==undefined || body.search=="") {
                query = "select * from plant";
            }else {
                query = `select * from plant where plant_id like '%${body.search}%' or name like '%${body.search}%'`;
            }
            connection.query(query,(error,plants)=>{
                if(!error) {
                    return response.render('all-plants',{ message: request.query.message, user_info: results[0], plants: plants });
                } else {
                    var message = "Something went wrong. Please try again.";
                    return response.redirect(`/user/all-users?mesage?=${encodeURIComponent(message)}`);
                }
            });
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/user/all-users?mesage?=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/add',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    response.render('add-plant',{ message: request.query.message });
});

router.post('/add',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    let plant = request.body;
    let user_id = request.user.user_id;
    var query = "insert into plant (name,image_url,watering,admin_user_id) values (?,?,?,?)";
    connection.query(query,[plant.name,plant.image_url,plant.watering,user_id],(error,results)=>{
        if(!error) {
            query = "select plant_id from plant where name=? and image_url=? and watering=? and admin_user_id=?";
            connection.query(query,[plant.name,plant.image_url,plant.watering,user_id],(error,plants)=>{
                if(!error) {
                    plant.sunlight.forEach(element => {
                        if (element!="") {
                            query = "insert into sunlight(sunlight,plant_id) values(?,?)";
                            connection.query(query,[element,plants[0].plant_id],(error,results)=>{
                                if(error){
                                    var message = "Something went wrong. Please try again."
                                    return response.redirect(`/plant/all-plants?message=${encodeURIComponent(message)}`);
                                }
                            });
                        }
                    });
                    var message = "Plant added successfully.";
                    return response.redirect(`/plant/all-plants?message=${encodeURIComponent(message)}`);
                } else {
                    var message = "Something went wrong. Please try again."
                    return response.redirect(`/plant/all-plants?message=${encodeURIComponent(message)}`);
                }
            })
        } else {
            var message = "Something went wrong. Please try again."
            return response.redirect(`/plant/all-plants?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/delete/:plant_id',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    const plant_id = request.params.plant_id;
    var query = "delete from user_add_plant where plant_id=?";
    connection.query(query,[plant_id],(error,results)=>{
        if(!error) {
            query = "delete from sunlight where plant_id=?";
            connection.query(query,[plant_id],(error,results)=>{
                if(!error) {
                    query = "delete from plant where plant_id=?";
                    connection.query(query,[plant_id],(error,results)=>{
                        if(!error) {
                            var message = "Plant Deleted successfully.";
                            return response.redirect(`/plant/all-plants?message=${encodeURIComponent(message)}`);
                        } else {
                            var message = "Something went wrong. Please try again.";
                            return response.redirect(`/plant/all-plants?message=${encodeURIComponent(message)}`);
                        }
                    });
                } else {
                    var message = "Something went wrong. Please try again.";
                    return response.redirect(`/plant/all-plants?message=${encodeURIComponent(message)}`);
                }
            })
        } else {
            var message = "Something went wrong. Please try again.";
            return response.redirect(`/plant/all-plants?message=${encodeURIComponent(message)}`);
        }
    });
});

module.exports = router;