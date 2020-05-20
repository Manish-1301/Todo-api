const mongooose=require('mongoose')

var user=mongooose.model('users',{
    email:{
        type: String,
        required: true,
        trim: true,
        minlength: 1
    }
})

module.exports= {user}