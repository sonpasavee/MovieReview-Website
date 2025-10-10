const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema = new Schema({
    movieId: {
        type: Number ,
        Required: true
    } ,
    userId: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User" ,
        required: true
    } ,
    name: {
        type: String , 
        required: true
    } ,
    comment: {
        type: String , 
        required: true
    } ,
    rating: {
        type: Number ,
        min: 1 ,
        max: 10 ,
        required: true
    } ,
    status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending', // ค่าเริ่มต้นคือรออนุมัติ
    },
    createdAt: {
        type: Date ,
        default: Date.now
    }
})

const Review = mongoose.model('Review' , ReviewSchema)
module.exports = Review