const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CollectionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User" ,
        required: true
    } ,
    name: {
        type: String , 
        required: true
    } ,
    description: String ,
    movies: [{
        type: Number
    }]
} , { timestamps: true })

const Collection = mongoose.model('Collection' , CollectionSchema)
module.exports = Collection