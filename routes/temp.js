const express = require("express");
const userRoute = express();

userRoute.set('view engine','ejs');
userRoute.set('views',"./views/users");

const bodyParser = require('body-parser');
userRoute.use(bodyParser.json);
userRoute.use(bodyParser.json);
userRoute.use(bodyParser.urlencoded({extended:true}));

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/userImages'));
    },
    filename:function(req,file,cb){
     const name = Date.now()+'-'+file.originalname;
     cb(null,name);
    }
});

const upload = multer({storage:storage});

const userController = require("../controller/userController");
userRoute.get('/register', userController.loadRegister);

userRoute.post('/register',upload.single('image'),userController.insertUser);

module.exports = userRoute;