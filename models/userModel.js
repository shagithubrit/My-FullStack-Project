const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
   
    email:{
        type:String,
        unique:true,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    mbno:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        require:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    },
    profile:{
        type:String,
        require:true
    },
    rating:{
        type:Number,
        default:0
    }
});

const User = mongoose.model("User",userSchema);

//module.exports = mongoose.model("User",userSchema);


const complainSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    complain:{
        type:String,
        required:true
    },
    customcomplain:{
        type:String,
        // required:true
    },
    pdf:{
        type:String,
        // required:true
    },
    is_admin:{
        type:Number,
        require:true
    },
    date:{
        type:String,
        required:true
    },
    review:{
        type:Number,
        default:0
    },
    status:{
        type:Number,
        default:0
    },
    solution:{
        type:String,
        default:""
    }
        
}); 
const Complain = mongoose.model("Complain",complainSchema);

module.exports = {
    User:  User,
    Complain: Complain
}