const User = require('../models/User')

module.exports = async (req, res) => {
  try {
    // ต้องมีการตั้งค่า req.session.userId ตอน login แล้ว
    const userId = req.session.userId
    if (!userId) {
      req.flash('error', 'กรุณาเข้าสู่ระบบ')
      return res.redirect('/login')
    }

    // ดึงข้อมูลผู้ใช้ (ใช้ .lean() ให้เร็วขึ้นและส่งเข้า view ง่าย)
    const user = await User.findById(userId).lean()
    if (!user) {
      // เซสชันค้าง/ผู้ใช้ถูกลบ
      req.session.destroy(() => {})
      req.flash('error', 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
      return res.redirect('/login')
    }

    // ส่งข้อมูลไปยัง view
    return res.render('userDashboard', {
      title: 'แดชบอร์ดผู้ใช้',
      user,                 // ใช้ใน EJS: <%= user.name %> เป็นต้น
      messages: req.flash() // แสดง flash message ในหน้าได้
    })
  } catch (err) {
    console.error('userDashboardController error:', err)
    req.flash('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    return res.redirect('/')
  }
}

