import mongoose from "mongoose";


// Other Schemas
const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
});

// Declare the Schema of the Mongo model
var oderSchema = new mongoose.Schema({
    items: [itemSchema],
    count: Number,
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'CANCELLED', 'DELIVERED'],
        default: 'PENDING'
    }
});

//Export the model
module.exports = mongoose.model('Order', oderSchema);