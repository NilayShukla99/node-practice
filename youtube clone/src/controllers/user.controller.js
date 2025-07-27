import { asyncHandler } from '../utils/asyncHandler.js'
import APIError from '../utils/APIError.js'
import APIResponse from '../utils/APIResponse.js'
import { User } from '../models/user.model.js'
import { removeFileFromCloudinary, uploadFileToCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
import { isValidEmail } from '../utils/validation.js'


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

const getCurrentUser = asyncHandler((req, res) => {
    // validate the user key exists
    const user = req?.user;
    if (!user) throw new APIError(401, 'Unauthorized, Try login again')
    return res.status(200).json(new APIResponse(200, user, 'Fetched the current logged in user'))
});
const getAccountDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        console.error('Unauthorized, User id missing')
        throw new APIError(401, 'Unauthorized, try login again!')
    }

    // fetch data from user id
    const userDetails = await User.findById(userId).select('-password -refreshToken')
    console.log(userDetails)

    if (!userDetails) {
        console.error('User not found. id: ', userId)
        throw new APIError(400, 'User not found')
    }
    return res
            .status(200)
            .json(new APIResponse(200, userDetails.toObject(), 'Successfully fetched the user details'))
});
const updateAccountDetails = asyncHandler(async (req, res) => {

    const user = req.user;
    const { userName = '', email = '', fullName = '' } = req.body;
    // !userName && !email && !fullName
    if (!(userName || email || fullName)) {
        throw new APIError(400, 'no fields are passed to update')
    }
    const update = {}
    if (userName) {
        if (userName.length <= 2) throw new APIError(400, 'Username must have at least 3 chars')
        update.userName = userName
    }
    if (email) {
        if (!isValidEmail(email))  throw new APIError(400, 'Invalid email')
        update['email'] = email
    }
    if (fullName) {
        if (fullName.length < 2) throw new APIError(400, 'Fullname must have at least 2 chars')
        Object.assign(update, { fullName })
    }

    // fetch user using id
    const dbUser = await User.findByIdAndUpdate(user._id, {
        $set: update
    }, { new: true }).lean().select('-password -refreshToken');
    // alternative 'lean' use
    // { new: true, lean: true });

    if (!dbUser) throw new APIError(400, 'User not found')
    res.status(200)
        . json(new APIResponse(200, dbUser, 'Successfully updated the user account details'))
});
const passwordChange = asyncHandler(async (req, res) => {

    const userId = req.user._id;
    const { currentPwd = '', newPwd = '' } = req.body;

    // confirm current password
    if (!(currentPwd && newPwd)) {
        throw new APIError(400, 'no fields are passed to update')
    }

    // fetch user to verify the pwd
    const dbUser = await User.findById(userId).select('-refreshToken');
    const isCurrPwdValid = await dbUser.isPasswordCorrect(currentPwd);
    if (isCurrPwdValid) {
        dbUser.password = newPwd;
        dbUser.save();
        const resUser = dbUser.toObject()
        delete resUser['password']
        res.status(200).json(new APIResponse(200, resUser, 'Password changed successfully'))
    }
    throw new APIError(400, 'Invalid current password')
    
});
const updateAvatar = asyncHandler(async (req, res) => {
    const avatarFile = req.file;

    if (!avatarFile) {
        console.error('Avatar file not present')
        throw new APIError(400, 'Avatar file not found')
    }
    
    // upload to cloudinary & obtain the public url
    const cloudinaryRes = await uploadFileToCloudinary(avatarFile.path)
    if (!cloudinaryRes) throw new APIError(500, 'Something went wrong while uploading the Avatar file')

    const newPubUrl = cloudinaryRes.url;
    // fetch user to update the avatar url
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    const oldUrl = user.avatar;
    user.avatar = newPubUrl;
    user.save()

    // remove the old url from cloudinary)
    removeFileFromCloudinary(oldUrl)
    res.status(200).json(new APIResponse(200, user, 'Avatar updated.'))
});
const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImgFile = req.file;

    if (!coverImgFile) {
        console.error('Cover Image file not present')
        throw new APIError(400, 'Cover Image file not found')
    }
    
    // upload to cloudinary & obtain the public url
    const cloudinaryRes = await uploadFileToCloudinary(coverImgFile.path)
    if (!cloudinaryRes) throw new APIError(500, 'Something went wrong while uploading the Cover Image file')

    const newPubUrl = cloudinaryRes.url;
    // fetch user to update the Cover Image url
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    const oldUrl = user.coverImage;
    user.coverImage = newPubUrl;
    user.save()

    // remove the old url from cloudinary)
    removeFileFromCloudinary(oldUrl)
    res.status(200).json(new APIResponse(200, user, 'Cover Image updated.'))
});
export { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, getAccountDetails, passwordChange, updateAccountDetails, updateAvatar, updateCoverImage }