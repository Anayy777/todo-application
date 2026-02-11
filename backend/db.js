const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema({
    email : {type : String , required : true , unique : true} , 
    password : {type : String , required : true} , 
    name : {type : String  , required : true}
} , {timestamps : true});

const userModel = mongoose.model('users' , userSchema);

const todoSchema = mongoose.Schema({
    todo : {type : String , required : true} , 
    done : {type : Boolean} ,
    userId : {type : ObjectId , ref : 'users'}
} , {timestamps : true});

const todoModel = mongoose.model('todo' , todoSchema);

module.exports = {
    userModel , todoModel
};