const express = require('express');
const connection = require('../connection');
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

router.get('/get',(request,response)=>{
    var query = "select * from plant order by plant_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            return response.status(200).json(results);
        } else {
            return response.status(500).json(error);
        }
    });
});

router.patch('/update-name',(request,response)=>{
    return updatePlant.updatePlant("name",request,response,connection);
});

router.patch('/update-image',(request,response)=>{
    return updatePlant.updatePlant("image_url",request,response,connection);
});

router.patch('/update-watering',(request,response)=>{
    return updatePlant.updatePlant("watering",request,response,connection);
});

module.exports = router;