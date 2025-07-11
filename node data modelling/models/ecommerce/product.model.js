// const mongoose = require('mongoose');
import mongoose from "mongoose";

// Declare the Schema of the Mongo model
const productSchema = new mongoose.Schema({
    title: {
        type:String,
        required:true,
        index:true,
    },
    description: {
        type: String,
        minLength: 10,
        maxLength: 50,
        required: true
    },
    productImage: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    stock: {
        type: Number,
        default: 0,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

//Export the model
// module.exports = mongoose.model('Product', productSchema);
export const Product = mongoose.model('Product', productSchema);