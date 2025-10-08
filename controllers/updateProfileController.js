const Profile = require('../models/Profile')

module.exports = async (req, res) => {
    try {
        const user = res.locals.UserData
        if (!user) {
            req.flash('error', 'Please login first')
            return res.redirect('/login')
        }

        // ดึงข้อมูลจากฟอร์ม
        const { name, email, bio, facebook, twitter, instagram } = req.body
        const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined

        // อัปเดตโปรไฟล์
        await Profile.findOneAndUpdate(
            { userId: user._id },
            {
                ...(avatarUrl && { avatarUrl }), // อัปเดตเฉพาะถ้ามีไฟล์ใหม่
                name,
                email,
                bio,
                facebook,
                twitter,
                instagram
            },
            { new: true, upsert: true }
        )

        req.flash('success', 'Update Profile')
        res.redirect('/user/dashboard')

    } catch (err) {
        console.error(err)
        req.flash('error', 'Cannot Update')
        res.redirect('/user/dashboard')
    }
}
