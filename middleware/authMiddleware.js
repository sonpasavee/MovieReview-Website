module.exports = {
    // ทุกคนต้องเข้าหน้านี้
    isAuthenticated: (req , res , next) => {
        if(req.session && req.session.user) {
            next()
        }else {
            res.redirect('/login')
        }
    } ,

    // ตรวจสอบว่าเป็นแอดมินไหม
    isAdmin: (req , res , next) => {
        if(req.session && req.session.user && req.session.user.role === 'admin') {
            next()
        }else {
            res.status(403).send('Access denided.Admin Only Na Ja EiEi!')
        }
    } ,

    // ตรวจสอบว่าเป็นuserไหม
    isUser: (req , res , next) => {
        if(req.session && req.session.user && req.session.user.role === 'user') {
            next()
        }else {
            res.status(403).send('Access denided.User Only Na Ja EiEi!')
        }
    }
}