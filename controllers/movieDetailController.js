const axios = require('axios')
const Review = require('../models/Review')
const Movie = require('../models/Movie')
require("dotenv").config()

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

module.exports = async (req, res) => {
    const movieId = Number(req.params.id) // แปลง param เป็น Number

    try {
        // ดึงข้อมูลจากapi
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: {
                api_key: process.env.TMDB_KEY,
                language: "en-US"
            }
        })
        // ดึงtrailerจากapi
        const videoRes = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos` , {
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
        await Movie.updateOne({ movieId } , { avgRating })


        res.render('movieDetail', { movieDetail, loggedIn: req.session.userId, avgRating , trailerKey: trailer ? trailer.key : null})

    } catch (err) {
        console.log(err)
        res.send('Error loading movie details')
    }
}
