const Review = require('../models/Review')

module.exports = async (req , res) => {
    try {
        const allReview = await Review.find()
        
    }catch(err) {

    }
    res.render('adminDashboard' , { allReview })
}