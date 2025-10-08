const mongoose = require('mongoose')
const Collection = require('../models/Collection')

module.exports = async (req, res) => {
    try {
        const user = res.locals.UserData
        if (!user) {
            req.flash('error', 'Please login first')
            return res.redirect('/login')
        }

        const userId = user._id
        const movieId = req.params.movieId // string
        const { name, collectionId } = req.body

        if (collectionId) {
            const collection = await Collection.findOne({ _id: collectionId, userId: userId })

            if (collection) {
                if (!collection.movies.includes(movieId)) {
                    collection.movies.push(movieId)
                    await collection.save()
                    req.flash('success', `Added to collection "${collection.name}"`)
                } else {
                    req.flash('error', 'Movie already in this collection')
                }
            } else {
                req.flash('error', 'Collection not found')
            }

        } else if (name) {
            const existCollection = await Collection.findOne({ userId: userId, name })
            if (existCollection) {
                req.flash('error', 'Collection name already exists')
            } else {
                await Collection.create({
                    userId: userId,
                    name,
                    movies: [movieId]
                })
                req.flash('success', `Created new collection "${name}" and added movie`)
            }

        } else {
            req.flash('error', 'No collection specified')
        }

        // redirect กลับไปหน้า movie detail พร้อม flash
        return res.redirect(`/movie/detail/${movieId}`)

    } catch (err) {
        console.error(err)
        req.flash('error', 'Server error')
        res.redirect(`/movie/detail/${req.params.movieId}`)
    }
}
