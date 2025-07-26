import { asyncHandler } from '../utils/asyncHandler.js'
import APIError from '../utils/APIError.js'
import APIResponse from '../utils/APIResponse.js'
import { User } from '../models/user.model.js'
import { uploadFileToCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'


const cookieOpt = { httpOnly: true, secure: true };
const jwtOpt = { 'algorithm': ['HS256'] }

const registerUser = asyncHandler(async (req, res) => {

    // receive req. form data
    const { userName, email, fullName, password } = req.body;

    // validate them
    if (!(userName && email && fullName && password)) {
        // res.status(400).json({
        //     message: 'Username is missing'
        // })
        throw new APIError(400, 'All fields are required')
    }
    // Email validation
    const isValidEmail = email => {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
        return emailRegex.test(String(email));
    };
    if (!isValidEmail) {
        throw new APIError(400, 'Email is invalid')
    }
    // existing user or not
    const existingUser = await User.findOne({
        $or: [{ email }, { userName }]
    })
    // console.log(`existingUser:`, existingUser)
    if (existingUser) throw new APIError(409, 'User already exists')

    // handle files
    console.log(`req.files:`, req.files)
    const localPathAvatar = req.files?.avatar[0]?.path
    const localPathCoverImage = req.files?.coverImage[0]?.path

    // console.log('localPathAvatar: ', localPathAvatar)
    // console.log('localPathCoverImage: ', localPathCoverImage)

    if (!localPathAvatar) throw new APIError(400, 'Avatar image is required')

    const avatar = await uploadFileToCloudinary(localPathAvatar)
    const coverImage = await uploadFileToCloudinary(localPathCoverImage)

    // upload user object
    const user = {}
        
    if (!avatar) {
        throw new APIError(500, 'Something went wrong while uploading Avatar')
    }
    if (localPathCoverImage) {
        const coverImage = await uploadFileToCloudinary(localPathCoverImage)
        Object.assign(user, { coverImage: coverImage?.url })
    }
    Object.assign(user, {
        userName,
        email,
        fullName,
        avatar: avatar.url,
        password
    })
    const savedUser = await User.create(user)

    if (!savedUser) throw new APIError(500, 'Something went wrong while saving user, please try again')
    console.log('user:', savedUser)

    /* 
        To remove specific fields from the response from DB
            `savedUser.select("-password -refreshToken")`
            the way to use: User.find(Query).select("-password -refreshToken")

    */
    const savedUserCopy = { ...savedUser.toObject() } // by default the variable has mongoose metadata about the object
    delete savedUserCopy['password']
    delete savedUserCopy['refreshToken']
    res.status(201).json(
        new APIResponse(201, savedUserCopy, 'User created successfully')
    )
});

const loginUser = asyncHandler(async (req, res) => {

    // data gathering
    if (!req.body) throw new APIError(400, 'Required data missing')
    const { userName, email, password } = req.body;
    
    // validation
    // (!userName || !email) = !(userName && email)
    const userNameOrEmail = userName || email;
    const reqFields = userNameOrEmail && password;
    if (!reqFields) {
        throw new APIError(400, 'Required fields are missing')
    }

    // db store ref. token and access token
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) throw new APIError(400, 'User not found')

    // validate password
    const isValidUser = await user.isPasswordCorrect(password);
    console.log('isValidUSer: ', isValidUser)

    if (isValidUser) {
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        user.save({ validate: false })
        
        // response
        const responseUser = user.toObject()
        delete responseUser['password']
        res
            .status(200)
            .cookie('accessToken', accessToken, cookieOpt)
            .cookie('refreshToken', refreshToken, cookieOpt)
            .json(new APIResponse(200, responseUser, 'User logged in successfully'))
    }
    throw new APIError(401, 'Bad Credentials')
});
const logoutUser = asyncHandler(async (req, res) => {
    // get the user from jwt
    const userId = req.user?._id;
    
    if (userId) {
        // remove from the DB
        const user = await User.findByIdAndUpdate(userId, {
            $set: { refreshToken: null }
        }, {
            new: true
        });
        // clear cookies 
        res.clearCookie('accessToken', cookieOpt)
        res.clearCookie('refreshToken', cookieOpt)
        return res
            .status(200)
            .json(new APIResponse(200, {}, 'User logged out'))
    }
    throw new APIError(500, 'User Id is missing')
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refTokenFromClient = req.cookies.refreshToken || req.body.refreshToken;
    if (!refTokenFromClient) {
        throw new APIError(401, 'Unauthorized')
    }
    const decodedToken = jwt.verify(refTokenFromClient, process.env.REFRESH_TOKEN_SECRET, jwtOpt)
    const user = await User.findById(decodedToken._id)

    if (!user) throw new APIError(401, 'Invalid refresh token')
    if (
        refTokenFromClient === user?.refreshToken
    ) {
        const newAccessToken = user.generateAccessToken()
        const newRefreshToken = user.generateRefreshToken()
        // response
        const responseUser = user.toObject()
        delete responseUser['password']
        delete responseUser['refreshToken']
        return res
            .status(200)
            .cookie('accessToken', newAccessToken, cookieOpt)
            .cookie('refreshToken', newRefreshToken, cookieOpt)
            .json(new APIResponse(200, responseUser, 'Tokens refreshed'))
    } else {
        throw new APIError(401, 'Refresh token is expired or used')
    }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken }