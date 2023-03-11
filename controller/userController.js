
const { User, Complain } = require('../models/userModel');

const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const config = require("../config/config");

const randomstring = require("randomstring");

const alert = require("alert");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
//Verify mail
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOptions = {
            from: 'chandan181singh@gmail.com',
            to: email,
            subject: 'For Verification at ComplainWebsite',
            html: '<p>Hii ' + name + ', Please Click here to <a href="http://localhost:3000/verify?id=' + user_id + '">Verify</a> your mail</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("please god");
                console.log(error);
            } else {
                console.log("Email has been sent:- ", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

//Loading page
const tempLoad = async (req, res) => {
    try {
        res.render('temp');
    } catch (error) {
        console.log(error.message);
    }
}
//registration
const loadRegister = async (req, res) => {
    try {
        res.render('registration');
    } catch (error) {
        console.log(error.message);
    }
}

//Forget password send email
const sendResetMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset password',
            html: '<p>Hii ' + name + ', Please Click here to <a href="http://localhost:3000/forget-password?token=' + token + '">Reset Password</a> </p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("please god");
                console.log(error);
            } else {
                console.log("Email has been sent:- ", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = User({
            name: req.body.name,
            email: req.body.email,
            mbno: req.body.mbno,
            profile: req.body.profile,
            image: req.file.filename,
            password: spassword,
            is_admin: 0
        });

        const userData = await user.save();

        if (userData) {
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('registration', { message: "Registered Successfully ,Please verify  your email" });
        } else {
            res.render('registration', { message: "Registered failed ,Please verify  your email" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
        console.log(updateInfo);
        res.render("login", { message: "Your email has been verified" });
    } catch (error) {
        console.log(error.message);
    }
}

//login method started

const loginLoad = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error);
    }
}
var Email;

const verifyLogin = async (req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.render('login', { message: "Please verify your mail." });
                } else {
                    Email = userData.email;
                    req.session.user_id = userData.id;
                    res.redirect('/home');
                }
            } else {
                res.render('login', { message: "Email or passworrd  is incorrect" });
            }
        } else {
            res.render('login', { message: "Email or passworrd  is incorrect" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id });
        const complainData = await Complain.find({email:userData.email});
        res.render('home', { user: userData, complain: complainData });
    } catch (error) {
        console.log(error.messgae);
    }
}
//logout 
const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

//forget password
const forgetLoad = async (req, res) => {
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            if (userData.is_verified === 0) {
                res.render('forget', { message: "Please Verify your mail" });
            } else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                sendResetMail(userData.name, userData.email, randomString);
                res.render('forget', { message: "Please Check your mail to reset your password" });
            }
        } else {
            res.render('forget', { message: "user email is incorrect." });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id });
        } else {
            res.render('404', { message: "Page not found" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);

        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { password: secure_password, token: '' });
        res.redirect('/');
    } catch (error) {
        console.log(error.messgae);
    }
}

const insertComplain = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id });
        const t = new Date();
        let d = t.getDate(), m = t.getMonth()+1, y = t.getFullYear(), hr = t.getHours(), min = t.getMinutes(), sec = t.getMinutes();
        if(d<10) d = "0"+ d;
        if(m<10) m = "0" + m;
        if(hr<10) h = "0"+hr;
        if(min < 10) min = "0"+min;
        if(sec <  10) sec = "0"+sec;
        const date = d + "/" + m + "/" + y;
        const time = hr+":"+min+":"+sec;
        const todayDate = date + ", " + time;
        const complain = Complain({
            name: userData.name,
            email: userData.email,
            complain: req.body.complain,
            customcomplain: req.body.customcomplain,
            pdf: req.file.filename,
            is_admin: 0,
            date: todayDate,
        });

        const userComplain = await complain.save();
        req.session.complain_id = userComplain.id;
        res.redirect('/home');
    } catch (error) {
        console.log(error.message);
    }
}

const loadComplain = async (req, res) => {
    try {
        //const userData = await Complain.findById({ _id: req.session.complain_id });
        const userData = await User.findById({ _id: req.session.user_id });
        const complainData = await Complain.find({email:Email});
        
        res.render('usercomplain', { complain: complainData, user: userData});
    } catch (error) {
        console.log(error.message);
    }
}


// userprofile Load

const editLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        if (userData) {
            res.render('edit', { user: userData });
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateProfile = async (req, res) => {
    try {

        if (req.file) {
            console.log("image coming");
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email, mbno: req.body.mbno, image:req.file.filename } });
        } else {
           const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email, mbno: req.body.mbno} });
        }
        res.redirect('/home');
    } catch (error) {
        console(error.message);
    }
};

//edit complains

const editLoad2 = async (req, res) => {
    try {
        const id = req.query.id;
        const complainData = await Complain.findById({ _id: id });
        if (complainData) {
            res.render('editcomplain', {complain: complainData });
        } else {
            res.redirect('/complain');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateComplain = async (req, res) => {
    try {

        if (req.file) {
            const userData = await Complain.findByIdAndUpdate({ _id: req.body.complain_id }, { $set: { complain: req.body.complain, customcomplain: req.body.customcomplain, pdf:req.file.filename } });
        } else {
           const userData = await Complain.findByIdAndUpdate({ _id: req.body.complain_id }, { $set: { complain: req.body.complain, customcomplain: req.body.customcomplain } });
        }
        res.redirect('/complain');
    } catch (error) {
        console.log(error.message);
    }
};

const deleteComplain = async (req,res) => {
    try {
        const data = await Complain.findByIdAndRemove({_id:req.query.id});
        console.log(data);
        res.redirect('/complain');
    } catch (error) {
        console.log(error.message);
    }
}

const loadUserStaus = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id });
        const complainData = await Complain.find({email:userData.email});
        res.render('complainStaus', { user: userData, complain: complainData });
    } catch (error) {
        console.log(error.messgae);
    }
}

const loadRate = async (req,res) =>{
    try{
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        res.render('rate',{ user: userData });
    } catch(error){
        console.log(error.message);
    }
}

const insertRating = async (req, res) =>{
    try{
        const userData = await User.findByIdAndUpdate({_id: req.body.user_id }, { $set: { rating: req.body.rating} });
        alert("Rating have been done successfully");
        res.redirect('/home');
    }catch(error){
        console.log(error.message);
    }
}

const loadDashboard = async (req,res) =>{
    try{
        const userData = await User.findById({ _id: req.session.user_id });
        const complainData = await Complain.find({email:userData.email});
        res.render('dashBoard', { user: userData, complain: complainData });
    }catch(error){
        console.log(error);
    }
} 

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    insertComplain,
    loadComplain,
    editLoad,
    updateProfile,
    editLoad2,
    updateComplain,
    tempLoad,
    deleteComplain,
    loadUserStaus,
    loadRate,
    insertRating,
    loadDashboard
}
