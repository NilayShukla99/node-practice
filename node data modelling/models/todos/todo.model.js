import mongoose from "mongoose";
import { SubTodo } from "./subTodo.model";

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'New Todo'
    },
    description: String,
    tags: [String],
    categories: [{ title: { type: String, required: true }, color: String }],
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User', // The exact name of the model
        required: true
    },
    // subTodos: [SubTodo] /* this import can create circular import issue, hence 'ref' way is preferred */
    subTodos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubTodo'
    }],
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

todoSchema.index({ title: 1 });
todoSchema.index({ user: 1 });
todoSchema.index({ user: 1, isCompleted: 1 });

export const Todo = mongoose.model('Todo', todoSchema);