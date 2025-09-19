const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema = new Schema({
    movieId: {
        type: String , 
        Required: true
    } ,
    userId: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User" ,
        required: true
    } ,
    username: {
        type: String , 
        required: true
    } ,
    comment: {
        type: String , 
        required: true
    } ,
    rating: {
        tpye: Number ,
        min: 1 ,
        max: 5 ,
        required: true
    } ,
    createdAt: {
        type: Date ,
        default: Date.now
    }
})

const Review = mongoose.model('Review' , ReviewSchema)
module.exports = Review