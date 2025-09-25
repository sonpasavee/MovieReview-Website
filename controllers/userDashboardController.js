const User = require('../models/User')
const Profile = require('../models/Profile')

module.exports = async (req, res) => {
  try {
    // ตรวจสอบว่า userId อยู่ใน session หรือไม่
    const users = res.locals.UserData
    const userId = users._id
    if (!userId) {
      req.flash('error', 'กรุณาเข้าสู่ระบบ')
      return res.redirect('/login')
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await User.findById(userId).lean()
    if (!user) {
      // หากไม่พบผู้ใช้ (session หมดอายุหรือถูกลบ) ให้ลบ session และให้เข้าสู่ระบบใหม่
      req.session.destroy(() => {})
      req.flash('error', 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
      return res.redirect('/login')
    }

    // ดึงข้อมูล profile ของผู้ใช้จาก collection Profile
    const profile = await Profile.findOne({ userId: user._id }).populate("userId")

    // ส่งข้อมูลไปยังหน้าแดชบอร์ด
    return res.render('userDashboard', { title: 'แดชบอร์ดผู้ใช้', user , profile , messages: req.flash() })
  } catch (err) {
    console.error('userDashboardController error:', err)
    req.flash('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    return res.redirect('/')
  }
}
