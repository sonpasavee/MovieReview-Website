const mongoose = require('mongoose')
const Collection = require('../models/Collection')

module.exports = async (req, res) => {
    try {
        const user = res.locals.UserData
        if (!user) {
            return res.status(401).json({ message: "Please login first" })
        }

        const userId = user._id
        const movieId = req.params.movieId // string
        const { name, collectionId } = req.body

        if (collectionId) {
            // ใช้ ObjectId ในกรณี schema เป็น ObjectId
            const collection = await Collection.findOne({ _id: collectionId, userId: userId })
            
            if (collection) {
                if (!collection.movies.includes(movieId)) {
                    collection.movies.push(movieId)
                    await collection.save()
                }
            } else {
                return res.status(404).json({ message: "Collection not found" })
            }

        } else if (name) {
            // เช็คชื่อ collection ซ้ำ
            const existCollection = await Collection.findOne({ userId: userId, name })
            if (existCollection) {
                return res.status(400).json({ message: "Collection name already exists" })
            } else {
                await Collection.create({
                    userId: userId,
                    name,
                    movies: [movieId]
                });
            }

        } else {
            return res.status(400).json({ message: "No collection specified" })
        }

        // redirect กลับไปหน้า movie detail
        return res.redirect(`/movie/detail/${movieId}`)

    } catch (err) {
        console.error(err)
        res.status(500).send('Server error')
    }
}
