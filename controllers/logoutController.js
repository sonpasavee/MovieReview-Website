// controllers/logoutController.js
// ควบคุมการlogoutของuser
module.exports = (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.log(err)
                return res.redirect('/')
            }
            res.redirect('/login')
        })
    } else {
        res.redirect('/login')
    }
}
