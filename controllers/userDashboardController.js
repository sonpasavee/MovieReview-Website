const User = require('../models/User')

module.exports = async (req, res) => {
  try {
    // ตรวจสอบว่า userId อยู่ใน session หรือไม่
    const userId = req.session.userId
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

    // เตรียมข้อมูลโปรไฟล์
    const profileData = {
      avatarUrl: user.avatarUrl || "",  // ถ้าไม่มี avatarUrl ให้เป็นค่าว่าง
      bio: user.bio || "",             // ถ้าไม่มี bio ให้เป็นค่าว่าง
      socialLinks: {
        facebook: user.socialLinks?.facebook || "",
        twitter: user.socialLinks?.twitter || "",
        instagram: user.socialLinks?.instagram || ""
      }
    }

    // ส่งข้อมูลไปยังหน้าแดชบอร์ด
    return res.render('userDashboard', {
      title: 'แดชบอร์ดผู้ใช้',
      user: { ...user, profileData },  // รวมข้อมูลผู้ใช้กับข้อมูลโปรไฟล์
      messages: req.flash()            // แสดงข้อความแจ้งเตือน
    })
  } catch (err) {
    console.error('userDashboardController error:', err)
    req.flash('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    return res.redirect('/')
  }
}
