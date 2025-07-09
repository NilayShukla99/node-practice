import mongoose from "mongoose";

const subTodoSchema = new mongoose.Schema({
    description: String,
    tags: [String],
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User', // The exact name of the model
        required: [true, 'User is required']
    }
}, {
    timestamps: true
});

export const SubTodo = mongoose.model('SubTodo', subTodoSchema);