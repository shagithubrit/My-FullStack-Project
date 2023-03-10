
const express = require("express");
const session = require("express-session");
const config = require("../config/config");
const userRoute = express();

userRoute.use(session({
secret:config.sessionSecrete,
resave:false,
saveUninitialized:false

}));

const auth = require("../middleware/auth");

userRoute.set('view engine','ejs');
userRoute.set('views',"./views/users");

const bodyParser = require('body-parser');
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}));

userRoute.use(express.static('public'));

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

const storage2 = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname, '../public/userpdfcomplain'));
    },
    filename:function(req,file,cb){
     const name = Date.now()+'-'+file.originalname;
     cb(null,name);
    }
});

const upload = multer({storage:storage});
const upload2 = multer({storage:storage2});


const userController = require("../controller/userController");
userRoute.get('/register',auth.isLogout, userController.loadRegister);

userRoute.post('/register',upload.single('image'),userController.insertUser);

userRoute.get('/verify',userController.verifyMail);

userRoute.get('/',auth.isLogout,userController.tempLoad);
userRoute.get('/login',auth.isLogout,userController.loginLoad);
userRoute.post('/login', userController.verifyLogin);

userRoute.get('/home',auth.isLogin, userController.loadHome);

userRoute.get('/logout',auth.isLogin,userController.userLogout);

userRoute.get('/forget',auth.isLogout,userController.forgetLoad);

userRoute.post('/forget',userController.forgetVerify);

userRoute.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);

userRoute.post('/forget-password',userController.resetPassword);

userRoute.post('/complain-submit',upload2.single('pdf'),userController.insertComplain);

userRoute.get('/complain',auth.isLogin,userController.loadComplain);

userRoute.get('/edit',auth.isLogin,userController.editLoad);

userRoute.post('/edit',upload.single('image'),userController.updateProfile);

userRoute.get('/editcomplain',auth.isLogin,userController.editLoad2);

userRoute.post('/editcomplain',upload2.single('pdf'),userController.updateComplain);

userRoute.get('/delete',auth.isLogin,userController.deleteComplain);

userRoute.get('/status',auth.isLogin,userController.loadUserStaus);

userRoute.get('/rate',auth.isLogin,userController.loadRate);

userRoute.post('/rate',auth.isLogin,userController.insertRating);

userRoute.get('/dashBoard',auth.isLogin,userController.loadDashboard);

module.exports = userRoute;
