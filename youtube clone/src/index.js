// require('dotenv').config({ path: './env' })

import dotenv from 'dotenv'
import mongoose, { connect } from "mongoose";
import express from 'express';
import connectDB from "./db/connection.js";

// `-r (preloads) the dotenv/config file` @package.json
dotenv.config({
    path: '.env',
    // processEnv: {
    //     PORT: 8080,
    //     DB_NAME: 'sdf',
    //     DB_URL: ''
    // }
})

connectDB();

/* 
// for practice purpose
const app = express();
(async () => {
    try {
        await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        app.on('error', err => {
            console.error('App is unable to connect with the DB: ', err);
            throw err;
        });

        // if no errors
        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on ${process.env.PORT}`);
        })

    } catch (error) {
        console.error('Error encountered while connecting the MongoDB: ', error);
        throw error;
    }
})(); */