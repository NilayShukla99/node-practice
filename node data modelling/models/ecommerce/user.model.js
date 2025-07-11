import mongoose from "mongoose";

const { Schema, model } = mongoose;
const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

export const User = model('User', userSchema);