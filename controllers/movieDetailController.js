const axios = require('axios')

require("dotenv").config()

const TMDB_BASE_URL = "https://api.themoviedb.org/3"

module.exports = async (req, res) => {
    const movieId = req.params.id

    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: {
                api_key: process.env.TMDB_KEY,
                language: "en-US"
            }
        })

        const movie = response.data;

        const movieDetail = {
            movieId: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            genres: movie.genres,
            vote_average: movie.vote_average
        };

        res.render('movieDetail', { movieDetail, loggedIn: req.session.userId });


    } catch (err) {
        console.log(err)
        res.send('Error loading movie details')
    }
}