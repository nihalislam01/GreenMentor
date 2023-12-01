const express = require('express');
var cors = require('cors');
const connection = require('./connection');
const userRoute = require('./routes/user');
const plantRoute = require('./routes/plant');
const eventRoute = require('./routes/event');
const postRoute = require('./routes/post');
const app = express();

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/user',userRoute);
app.use('/plant',plantRoute);
app.use('/event',eventRoute);
app.use('/post',postRoute);

module.exports = app;