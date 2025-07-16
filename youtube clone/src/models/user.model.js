import mongoose, { Schema, model } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: {
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        trim: true
    },
    refreshToken: {
        type: String,
        required: true
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    bcrypt.hash(this.password, 10);
    next();
});

/* defining the custom methods */
userSchema.methods.isPasswordCorrect = async function (pwd) {
    return await bcrypt.compare(pwd, this.password)
}
userSchema.methods.generateAccessToken = async function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName
    }, process.env.ACCESS_TOKEN_SECRET, {
        'expiresIn': process.env.ACCESS_TOKEN_EXPIRY,
        'algorithm': 'HS256'
    })
}
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, {
        'expiresIn': process.env.REFRESH_TOKEN_EXPIRY,
        'algorithm': 'HS256'
    })
}

export const User = model('User', userSchema);