const User = require('../models/User')
const Profile = require('../models/Profile')

module.exports = async (req, res) => {
    try {
        // สร้าง user
        const user = await User.create(req.body)
        console.log("User registered succesfully!")

        // สร้างprofileให้user
        const profile = new Profile({
            userId: user._id,
            avatarUrl: req.body.avatarUrl || undefined , 
            bio: "",
            socialLinks: {
                facebook: "",
                twitter: "",
                instagram: ""
            }
        })

        await profile.save()
        console.log("Profile created successfully!")

        // session userId = user._id
        req.session.userId = user._id

        // กลับไปหน้า home
        res.redirect('/login')
    } catch (error) {
        console.log(error)
        if (error.errors) {
            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
            req.flash('validationErrors', validationErrors)
            req.flash('data', req.body)
        }
        return res.redirect('/register')
    }
}