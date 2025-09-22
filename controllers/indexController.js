const User = require('../models/User')
const axios = require('axios')
require("dotenv").config()

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

module.exports = async (req, res) => {
    try {
        // ดึงข้อมูล user
        let UserData = null
        if (req.session.userId) {
            UserData = await User.findById(req.session.userId)
        }

        // ดึงข้อมูลหนังจาก TMDb
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: process.env.TMDB_KEY,
                language: "en-US",
                page: 1
            }
        })

        const movies = response.data.results.map(movie => ({
            movieId: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }))
        
        const recommendMovies = movies.slice(0, 3).map((m, index) => ({
            ...m,
            customPoster: index === 0 ? "/images/demon.png" :
                index === 1 ? "/images/war.jpeg" :
                    index === 2 ? "/images/conjur.jpg" :
                        null
        }))


        // render หน้า index
        res.render('index', { movies, UserData, recommendMovies })


    } catch (err) {
        console.error(err)
        res.send("Error loading home page")
    }
}
