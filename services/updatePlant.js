function updatePlant(attribute,request,response,connection) {
    let plant = request.body;
    var query = `update plant set ${attribute}=? where plant_id=?`;
    connection.query(query,[plant.attribute,plant.plant_id],(error,results)=>{
        if(!error) {
            if (results.affectRows == 0) {
                return response.status(404).json({message: "Plant id does not exists."});
            } else {
                return response.status(200).json({message: `${attribute} updated successfully.`});
            }
        } else {
            return response.status(500).json(error);
        }
    });
}

module.exports = { updatePlant:updatePlant }