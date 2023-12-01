const express = require('express');
const connection = require('../connection');
const router = express.Router();

router.post('/add',(request,response)=>{
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

router.get('/get',(request,response)=>{
    var query = "select * from event order by event_id desc";
    connection.query(query,(error,results)=>{
        if(!error) {
            return response.status(200).json(results);
        } else {
            return response.status(500).json(error);
        }
    });
});

module.exports = router;