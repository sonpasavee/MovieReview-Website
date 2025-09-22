const User = require('../models/User')
const axios = require('axios')
const Movie = require('../models/Movie')
const Review = require('../models/Review')
require("dotenv").config()

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

module.exports = async (req, res) => {
    try {
        // ดึงข้อมูล user
        let UserData = null
        if (req.session.userId) {
            UserData = await User.findById(req.session.userId)
        }

        // pagination
        const page = parseInt(req.query.page) || 1
        // ดึงข้อมูลหนังจาก TMDb หนังล่าสุด
        const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
            params: {
                api_key: process.env.TMDB_KEY,
                language: "en-US",
                page: page
            }
        })

        const totalPages = response.data.total_pages

        const latestMovies = response.data.results.map(movie => ({
            movieId: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }))

        // หนังยอดนิยมอิงจาก DB ของเรา
        const popularMovies = await Movie.find({ avgRating : { $ne : null } }).sort({ avgRating : -1 }).limit(10)

        // หนังแนะนำ
        const recommendMovies = latestMovies.slice(0, 3).map((m, index) => ({
            ...m,
            customPoster: index === 0 ? "/images/demon.png" :
                index === 1 ? "/images/war.jpeg" :
                    index === 2 ? "/images/conjur.jpg" :
                        null
        }))
        const reviews = await Review.find({}).lean()

        // render หน้า index
        res.render('index', { latestMovies, UserData, recommendMovies , popularMovies , reviews , currentPage: page , totalPages })

         

    } catch (err) {
        console.error(err)
        res.send("Error loading home page")
    }
}
