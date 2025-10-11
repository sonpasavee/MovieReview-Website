const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt') //encryt password

const UserSchema = new Schema({
    name: {
        type: String , 
        required: true
    } ,
    email: {
        type: String , 
        required: [true , 'Please provide email'] ,
        unique: true
    } ,
    password: {
        type: String ,
        required: [true , 'Please provide password']
    } ,
    role: {
        type: String , 
        enum: ['user' , 'admin'] , 
        default: 'user'
    } ,
    isBanned: {
        type: Boolean,
        default: false
    }
} , {timestamps:true})

UserSchema.pre('save' , function(next) {
    const user = this

    bcrypt.hash(user.password , 10).then(hash => {
        user.password = hash
        next()
    }).catch(error => {
        console.error(error)
    })
})

// export schema to model
const User = mongoose.model('User' , UserSchema)
module.exports = User

