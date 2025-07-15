import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import userController from '../controllers/usercontroller.js';

const userSchema = new Schema(
    
    
    {
    userName: {
        type: String,
        // required: true,
        trim: true,
        unique: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        // required: true,
        unique: true,
        trim: true,
        lowercase: true,

    },
    fullName:{
        type: String,
        // required: true,
        trim: true,
        index: true
    },
    avtar:{
        type: String,
        // required: true,
        trim: true,

    },
    coverImage:{
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    watchHistory:[{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    refreshToken: {
        type: String,
        default: null
    },


});
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        return next();
    }
   this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
     return await bcrypt.compare(password, this.password);   
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign({ 
        __Id: this._id ,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName,
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({ 
        __Id: this._id ,
    }, 
    process.env.REFERSH_TOKEN_SECRET, 
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}


export const User = mongoose.model("User", userSchema);