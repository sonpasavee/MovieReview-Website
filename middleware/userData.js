// ประกาศuser dataให้ทุกviewใช้ได้
const User = require('../models/User')

module.exports = async (req, res, next) => {
    try {
        if(req.session && req.session.userId) {
            const user = await User.findById(req.session.userId)
            res.locals.UserData = user
        } else {
            res.locals.UserData = null
        }
        next()
    } catch (err) {
        console.error(err)
        res.locals.UserData = null
        next()
    }
}
