import APIError from "../utils/APIError"
import { asyncHandler } from "../utils/asyncHandler"
import jwt from 'jsonwebtoken'

export const authenticate = asyncHandler(async (req, res, next) => {

    // get accessToken from `cookies || jwt`
    const accessToken = req.cookies?.accessToken || req.header('Authorization').replace('Bearer ', '')
    if (!accessToken) throw new APIError(401, 'Access token not found')

    const jwtOpt = {
        'algorithm': ['HS256']
    }
    const decodedTokenOrUser = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, jwtOpt, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') throw new APIError(401, 'Access token has expired')
            throw new APIError(403, 'Access token is not valid')
        }
        res.user = user;
        next()
    })
     // similar to res.user = decodedTokenOrUser
    //  next()

});