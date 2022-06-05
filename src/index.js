const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const multer= require("multer");
//const { AppConfig } = require('aws-sdk');
app.use( multer().any())


mongoose.connect("mongodb+srv://product_management:Rnr06LEBUzt7Ykwf@cluster0.r2r1ele.mongodb.net/group35Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected.."))
.catch ( err => console.log(err))


app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});