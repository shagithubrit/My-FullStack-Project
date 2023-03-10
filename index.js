const mongoose = require("mongoose");
const express = require('express');
mongoose.connect("mongodb://localhost:27017/UserDb12", {
    useNewUrlParser: "true"
});

const app = express();
app.use(express.static(__dirname));

const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

app.listen(3000, () => {
    console.log('Server is up on port 3000');
});