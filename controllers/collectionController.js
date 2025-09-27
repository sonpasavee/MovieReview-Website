const Collection = require('../models/Collection')
const Movie = require('../models/Movie')

module.exports = async (req, res) => {
  try {
    const user = res.locals.UserData
    if (!user) {
      req.flash('error', 'Please login first')
      return res.redirect('/login')
    }

    const collections = await Collection.find({ userId: user._id })

    const collectionsWithMovies = await Promise.all(collections.map(async (c) => {
      const movies = await Movie.find({ movieId: { $in: c.movies } })
      return { ...c.toObject(), movies }
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

  const { id } = req.params
  const { name } = req.body
  if (!name || name.trim() === '') return res.status(400).send('Name is required')

  try {
    await Collection.updateOne({ _id: id, userId: user._id }, { name: name.trim() })
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
}