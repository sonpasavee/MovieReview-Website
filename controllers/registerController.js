module.exports = (req , res) => {

    let name = ""
    let email = ""
    let password = ""
    let data = req.flash('data')[0]
    
    if(typeof data != "undefined") {
        name = data.name
        email = data.email
        password = data.password
    }

    res.render('register' , {
        errors: req.flash('validationErrors') ,
        name: name ,
        email: email ,
        password: password
    })
}