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
    default: ""
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
