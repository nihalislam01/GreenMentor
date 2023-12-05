const express = require('express');
const connection = require('../connection');
var auth = require('../services/authentication');
var checkAdmin = require('../services/checkAdmin');
var checkPremium = require('../services/checkPremium');
const router = express.Router();
const updatePlant = require('../services/updatePlant');

router.get('/get',auth.authenticateToken,(request,response,next)=>{
    var query = "select name,image_url from plant order by plant_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('plants',{ message: request.query.message, plants: results });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/dashboard?message=${encodeURIComponent(message)}`);
        }
    });
});

router.get('/my-plants',auth.authenticateToken,(request,response,next)=>{
    const user_id = request.user.user_id;
    var query = `select * from user_add_plant inner join plant on plant.plant_id=user_add_plant.plant_id where user_add_plant.general_user_id=${user_id}`;
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('my-plants',{ message: request.query.message, plants: results });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/user/profile?message=${encodeURIComponent(message)}`);
        }
    });
});

router.post('/add-to-profile/:plant_id',auth.authenticateToken,(request,response,next)=>{
    const request_param = request.params.plant_id;
    const user_id = request.user.user_id;
    var query = `insert into user_add_plant(general_user_id,plant_id) values(${user_id},${request_param})`;
    connection.query(query,(error,results)=>{
        if(!error){
            var message = "Plant added to profile successfully."
            response.redirect(`/user/my-plants?message=${encodeURIComponent(message)}`);
        } else {
            var message = "Something went wrong. Please try again.";
            response.redirect(`/user/my-plants?message=${encodeURIComponent(message)}`);
        }
    });
});

//Admin User Controllers
router.get('/add',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    response.render('add-plant',{ message: request.query.message });
});

router.post('/add',auth.authenticateToken,checkAdmin.checkAdmin,(request,response,next)=>{
    let plant = request.body;
    let user_id = request.user.user_id;
    var query = `insert into plant (name,image_url,watering,admin_user_id) values (?,?,?,${user_id})`;
    connection.query(query,[plant.name,plant.image_url,plant.watering],(error,results)=>{
        if(!error) {
            return response.status(200).json({message: "Plant added successfully."});
        } else {
            return response.status(500).json(error);
        }
    });
});

router.patch('/update-name',auth.authenticateToken,checkAdmin.checkAdmin,(request,response)=>{
    return updatePlant.updatePlant("name",request,response,connection);
});

router.patch('/update-image',auth.authenticateToken,checkAdmin.checkAdmin,(request,response)=>{
    return updatePlant.updatePlant("image_url",request,response,connection);
});

router.patch('/update-watering',auth.authenticateToken,checkAdmin.checkAdmin,(request,response)=>{
    return updatePlant.updatePlant("watering",request,response,connection);
});

module.exports = router;