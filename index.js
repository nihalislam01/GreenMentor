const express = require('express');
var cors = require('cors');
const connection = require('./connection');
const userRoute = require('./routes/user');
const cookieParser = require('cookie-parser');
const plantRoute = require('./routes/plant');
const eventRoute = require('./routes/event');
const postRoute = require('./routes/post');
const formattedDate = require('./services/formattedDate');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(express.static('assets'));
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use('/user',userRoute);
app.use('/plant',plantRoute);
app.use('/event',eventRoute);
app.use('/post',postRoute);

app.get('/home',(request,response)=>{
    response.render('cover',{message: request.query.message });
});
app.get('/events',(request,response)=>{
    query = "select event_id,title,start_date,end_date,location from event where start_date<CURRENT_TIMESTAMP and end_date>CURRENT_TIMESTAMP order by event_id desc";
    connection.query(query,(error,results)=>{
        if(!error){
            response.render('cover-event',{message: request.query.message, events: results, formattedDate: formattedDate.formattedDate });
        } else {
            var message = "Something went wrong. Please try again."
            response.redirect(`/home?message=${encodeURIComponent(message)}`)
        }
    });
});

module.exports = app;