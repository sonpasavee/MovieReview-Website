const Review = require('../models/Review')
const Movie = require('../models/Movie')
const User = require('../models/User')
const axios = require('axios')

module.exports = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body

        if (!req.session.userId) 
            return res.status(401).send('Please login first')

        const user = await User.findById(req.session.userId)
        if (!user) 
            return res.status(404).send('User not found')

        // หา Movie ใน DB
        let movie = await Movie.findOne({ movieId })
        if (!movie) {
            // ถ้าไม่มี ดึงข้อมูลจาก TMDb API
            const response = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_KEY}&language=en-US`
            )
            const movieData = response.data

            movie = await Movie.create({
                movieId: movieData.id,
                title: movieData.title,
                posterPath: movieData.poster_path,
                releaseDate: movieData.release_date,
                genres: movieData.genres.map(g => g.name) // เติม genres จาก API
            })
        }

        // สร้างรีวิว
        await Review.create({
            movieId: movie.movieId,
            userId: user._id,
            name: user.name,
            rating,
            comment
        })

        res.redirect(`/movie/detail/${movie.movieId}`)
    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
}
