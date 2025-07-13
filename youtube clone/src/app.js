import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();


const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
};
app.use(cors(corsOptions)); // to use at top level as middleware

// we can use it for specific route also e.g. `app.get('/jokes', cors({...}), (req, res, next) => {...})

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))
app.use(cookieParser())


export { app };