// เขียนโค้ดควบคุมหน้า review page
const Movie = require('../models/Movie')
const axios = require('axios')

module.exports = async (req, res) => {
    let movie = await Movie.findOne({ movieId: req.params.movieId })

    try {
        if (!movie) {
            const apiKey = process.env.TMDB_KEY
            const response = await axios.get(`https://api.themoviedb.org/3/movie/${req.params.movieId}?api_key=${apiKey}&language=en-US`)
            const data = response.data

            movie = {
                movieId: data.id,
                title: data.title,
                overview: data.overview,
                posterPath: data.poster_path,
                releaseDate: data.release_date,
                genres: data.genres
            }
        }
    } catch (err) {
        console.log(err)
    }

    res.render('reviewPage', { movie })
}
