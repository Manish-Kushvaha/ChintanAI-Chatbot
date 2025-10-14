import passportLocalMongoose from 'passport-local-mongoose';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({  
    email:{
        type: String,
        required : true,
        unique: true 
    }, // passport-local-mongoose will automatically defined username and password field
});


userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
export default User;