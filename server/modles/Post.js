const mongoose=require('mongoose')

const Schema=mongoose.Schema;
const PostSchema= new Schema({
    title:{
        type: String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    },
    owner:{
        type:String,
        required:true,
        default:'64bbcffead98b9eb28dd1eb2'
    }

});

module.exports = mongoose.model('Post',PostSchema)