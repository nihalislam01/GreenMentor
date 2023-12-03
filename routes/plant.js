const express = require('express');
const connection = require('../connection');
var auth = require('../services/authentication');
var checkAdmin = require('../services/checkAdmin');
const router = express.Router();
const updatePlant = require('../services/updatePlant');

router.post('/add',(request,response)=>{
    let plant = request.body;
    var query = "insert into plant (name,image_url,watering,admin_user_id) values (?,?,?,?)";
    connection.query(query,[plant.name,plant.image_url,plant.watering,plant.admin_user_id],(error,results)=>{
        if(!error) {
            return response.status(200).json({message: "Plant added successfully."});
        } else {
            return response.status(500).json(error);
        }
    });
});

router.get('/get',auth.authenticateToken,(request,response)=>{
    var query = "select * from plant order by plant_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            response.render('plants',{ results });
        } else {
            response.status(500).send(error);
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