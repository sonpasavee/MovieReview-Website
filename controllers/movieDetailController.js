const axios = require('axios')
const Review = require('../models/Review')
const Movie = require('../models/Movie')
const Collection = require('../models/Collection')
require("dotenv").config()

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

module.exports = async (req, res) => {
    const movieId = Number(req.params.id) // แปลง param เป็น Number
    const user = res.locals.UserData

    let userCollections = []
    if(user) {
        userCollections = await Collection.find({ userId: user._id })
    }

    
    try {
        // ดึงข้อมูลจากapi
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: {
                api_key: process.env.TMDB_KEY,
                language: "en-US"
            }
        })
        // credit crew
        const creditsRes = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
            params: {
                api_key: process.env.TMDB_KEY
            }
        })
        const credits = creditsRes.data
        // director data
        const directorObj = credits.crew.find(member => member.job === 'Director')
        const director = directorObj ? directorObj.name : 'N/A'
        // cast data 
        const cast = credits.cast ? credits.cast.slice(0 , 5).map(c => c.name) : 'N/A'

        // ดึงtrailerจากapi
        const videoRes = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
            params: {
                api_key: process.env.TMDB_KEY,
                language: "en-US"
            }
        })

        const movie = response.data


        // ดึงรีวิวจาก DB
        const reviews = await Review.find({ movieId: movieId })

        // map รีวิวสำหรับส่งไป view
        const movieDetail = {
            movieId: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            genres: movie.genres,
            vote_average: movie.vote_average,
            duration: movie.runtime ,
            cast: cast ,
            director: director ,
            reviews: reviews.map(r => ({
                userName: r.name,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt
            }))
        }

        // หาวิดีโอ trailer
        const trailer = videoRes.data.results.find(
            v => v.type === 'Trailer' && v.site === 'YouTube'
        )

        // คำนวณค่าเฉลี่ย rating
        const avgRatingResult = await Review.aggregate([
            { $match: { movieId } },
            { $group: { _id: "$movieId", avg: { $avg: "$rating" } } }
        ]);
        const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avg : null
        await Movie.updateOne({ movieId }, { avgRating })
        const m = await Movie.findOne({ movieId })

        res.render('movieDetail', { movieDetail, loggedIn: req.session.userId, avgRating, trailerKey: trailer ? trailer.key : null, m , userCollections})

    } catch (err) {
        console.log(err)
        res.send('Error loading movie details')
    }
}
