const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MovieSchema = new Schema({
    movieId: {
        type: String , 
        required: true ,
        unique: true
    } ,
    title: {
        type: String ,
        required: true
    } ,
    overview: String ,
    posterPath: String ,
    releaseDate: String , 
    genres: [String] ,
    cachedAt: {
        type: Date ,
        default: Date.now
    }
})

const Movie = mongoose.model('Movie' , MovieSchema)
module.exports = Movie