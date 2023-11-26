const express = require('express');
const connection = require('../connection');
const router = express.Router();

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
    let plant = request.body;
    var query = "update plant set name=? where plant_id=?";
    connection.query(query,[plant.name,plant.plant_id],(error,results)=>{
        if(!error) {
            if (results.affectRows == 0) {
                return response.status(404).json({message: "Plant id does not exists."});
            } else {
                return response.status(200).json({message: "Name updated successfully."});
            }
        } else {
            return response.status(500).json(error);
        }
    });
});

router.patch('/update-image',(request,response)=>{
    let plant = request.body;
    var query = "update plant set image_url=? where plant_id=?";
    connection.query(query,[plant.image_url,plant.plant_id],(error,results)=>{
        if(!error) {
            if (results.affectRows == 0) {
                return response.status(404).json({message: "Plant id does not exists."});
            } else {
                return response.status(200).json({message: "Image updated successfully."});
            }
        } else {
            return response.status(500).json(error);
        }
    });
});

router.patch('/update-watering',(request,response)=>{
    let plant = request.body;
    var query = "update plant set watering=? where plant_id=?";
    connection.query(query,[plant.watering,plant.plant_id],(error,results)=>{
        if(!error) {
            if (results.affectRows == 0) {
                return response.status(404).json({message: "Plant id does not exists."});
            } else {
                return response.status(200).json({message: "Watering updated successfully."});
            }
        } else {
            return response.status(500).json(error);
        }
    });
});

module.exports = router;