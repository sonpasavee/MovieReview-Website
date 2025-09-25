const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProfileSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  avatarUrl: {
    type: String,
    default: "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=170667a&w=0&k=20&c=LPUo_WZjbXXNnF6ok4uQr8I_Zj6WUVnH_FpREg21qaY="
  },
  bio: {
    type: String,
    default: ""
  },
  socialLinks: {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" }
  }
}, { timestamps: true })

const Profile = mongoose.model('Profile', ProfileSchema)
module.exports = Profile
