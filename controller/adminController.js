const {User, Complain} = require("../models/userModel");
const bcrypt = require('bcrypt');
const loadLogin = async(req,res)=>{
    try{
         res.render('login');
    }catch(error){
        console.log(error.message);
    }
}

var email;
const verifyLogin = async(req,res)=>{
    try{

        email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email});
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_admin === 0){
                    res.render('login',{message:"Email or password is incorrect"});
                }else{
                    req.session.user_id = userData.id;
                    res.redirect("/admin/home");
                }
            }else{
                res.render('login',{message:"Email or password is incorrect"});``
            }
        }else{
            res.render('login',{message:"Email or password is incorrect"});``
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadDashboard = async(req,res)=>{
    try{
       const complainData = await Complain.find({is_admin:0});
       const userData = await User.findOne({email:email});
       res.render('home',{users:complainData, user:userData});
    }catch(error){
        console.log(error.message);
    }
}

const logout = async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/admin');
    }catch(error){
        console.log(error.message);
    }
}

const adminDashboard = async(req,res)=>{
    try{
          const complainData = await Complain.find({is_admin:0});
          console.log(complainData);
          res.render('dashboard',{users:complainData});
    }catch(error){
       console.log(error.message);
    }
}

const reviewLoad = async(req,res)=>{
    try{
        const upadateReview = await Complain.updateOne({ _id: req.query.id }, { $set: { review: 1 } });
        const complainData = await Complain.findOne({ _id: req.query.id });
        console.log(complainData.customcomplain);
        const userData = await User.findOne({email:email});
          console.log(complainData);
          res.render('review',{complain:complainData, user:userData});
    }catch(error){
        console.log(error.message);
    }
}

const editStatus = async(req,res)=>{
      try{
        const upadateReview = await Complain.updateOne({ _id: req.query.id }, { $set: { status: 1 } });
        res.redirect('/admin/home');
      }catch(error){
        console.log(error);
      }
}

const insertSol = async(req,res)=>{
    try{
        const sol = await Complain.updateOne({ _id: req.body.complain_id }, { $set: {solution: req.body.sol } });
        console.log(req.body.sol);
        res.redirect('/admin/home');
    }catch(error){
        console.log(error);
    }
}
module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    reviewLoad,
    editStatus, 
    insertSol
}