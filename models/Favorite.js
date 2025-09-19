const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FavoriteSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User" , 
        required: true
    } ,
    movieId: {
        type: String ,
        required: true
    } ,
    createdAt: {
        type: Date ,
        default: Date.now
    }
})

const Favorite = mongoose.model('Favorite' , FavoriteSchema)
module.exports = Favorite