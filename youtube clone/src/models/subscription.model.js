import { Schema, model } from 'mongoose'


// A collection to hold details about the subscriber id and channel id
const subscriptionSchema = new Schema({

    // The user who is subscribing the another user (channel)
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // The user who got subscription
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

export const Subscription = model('Subscription', subscriptionSchema);