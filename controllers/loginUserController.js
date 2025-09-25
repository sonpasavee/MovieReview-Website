const bcrypt = require('bcrypt')
const User = require('../models/User')

module.exports = (req, res) => {
    const { email, password } = req.body

    User.findOne({ email: email }).then((user) => {
        console.log(user)

        if (user) {
            let compare = bcrypt.compare(password, user.password).then((match) => {
                if (match) {
                    req.session.userId = user._id
                    req.session.user = {
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }


                    if (user.role === 'admin') {
                        res.redirect('/admin/dashboard')
                    } else if (user.role === 'user') {
                        res.redirect('/user/dashboard')
                    }else {
                        res.redirect('/')
                    }

                } else {
                    req.flash('error', 'รหัสผ่านไม่ถูกต้อง')
                    res.redirect('/login')
                }
            })
        } else {
            req.flash('error', 'ไม่พบผู้ใช้')
            res.redirect('/login')
        }
    }).catch(err => {
        console.log(err)
        req.flash('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        res.redirect('/login')
    })
}