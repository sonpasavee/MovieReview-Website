const Collection = require('../models/Collection')
const axios = require('axios')
const dotenv = require('dotenv')
const TMDB_BASE_URL = "https://api.themoviedb.org/3/movie"
dotenv.config()

module.exports = async (req, res) => {
  try {
    const user = res.locals.UserData
    if (!user) {
      req.flash('error', 'Please login first')
      return res.redirect('/login')
    }

    const collections = await Collection.find({ userId: user._id })

     const collectionsWithMovies = await Promise.all(collections.map(async (c) => {
      const movies = await Promise.all(c.movies.map(async (tmdbId) => {
        try {
          const response = await axios.get(`${TMDB_BASE_URL}/${tmdbId}`, {
            params: { api_key: process.env.TMDB_KEY, language: 'th-TH' } // เปลี่ยนภาษาได้
          })
          return { ...response.data, tmdbId }
        } catch (err) {
          console.error(`Error fetching movie ${tmdbId}`, err.message)
          return null
        }
      }))

      // กรอง movie ที่ไม่สำเร็จ
      const validMovies = movies.filter(m => m !== null)
      return { ...c.toObject(), movies: validMovies }
    }))

    res.render('collection', { collections: collectionsWithMovies, loggedIn: req.session.userId })

  } catch (err) {
    console.error(err)
    req.flash('error', 'Server error')
    res.redirect('/')
  }
}

module.exports.removeMovie = async (req, res) => {
  try {
    const user = res.locals.UserData
    if (!user) return res.redirect('/login')

    const { collectionId, movieId } = req.params
    await Collection.updateOne({ _id: collectionId, userId: user._id }, { $pull: { movies: movieId } })
    res.redirect('/collection')
  } catch (err) {
    console.error(err)
    req.flash('error', 'Server error')
    res.redirect('/collection')
  }
}

module.exports.deleteCollection = async (req, res) => {
  try {
    const user = res.locals.UserData
    if (!user) return res.redirect('/login')

    await Collection.deleteOne({ _id: req.params.collectionId, userId: user._id })
    res.redirect('/collection')
  } catch (err) {
    console.error(err)
    req.flash('error', 'Server error')
    res.redirect('/collection')
  }
}

module.exports.renameCollection = async (req, res) => {
  const user = res.locals.UserData
  if (!user) return res.status(401).send('Unauthorized')

  const { collectionId } = req.params
  const { name } = req.body
  if (!name || name.trim() === '') return res.status(400).send('Name is required')

  try {
    await Collection.updateOne({ _id: collectionId , userId: user._id }, { name: name.trim() })
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
}