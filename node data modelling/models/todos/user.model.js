import mongoose from "mongoose";

const { Schema, model } = mongoose;
const userSchema = new Schema({
    userName : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, 'username must be at least 3 chars'],
        minlength: [10, 'username cannot be exceed 10']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'email is required'], // custom error messages
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+\$/, 'Email format is not supported']
    },
    // isLoggedIn: Boolean,
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    tagline: String
}, {
    timestamps: true, // covers 'createdAt' and 'updatedAt'
    query: {
            // byName: (name) => {
            //     return this.where({userName: new RegExp(name, 'i')}) // 'this' won't work here
            // },
            byName (name) {
                return this.where({ userName: new RegExp(name, 'i') })
            }
        }
   }
);

userSchema.index({ email: 1 });
userSchema.index({ userName: 1 });


export const User = model('User', userSchema);