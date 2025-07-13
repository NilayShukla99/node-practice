// latest and shorten way
const asyncHandler = fn => (req, res, next) => {
    Promise
        .resolve(fn(req, res, next))
        .catch((err) => next(err))
}


// Using try-catch
// const asyncHandler = (reqHandler) => {
//     return async (req, res, next) => {
//         try {
//             await reqHandler(req, res, next)
//         } catch (error) {
//             /* pass the error info to next fn */
//             // next({
//             //     success: false,
//             //     code: error.code || 500,
//             //     message: error.message
//             // })

//             /* return response with error info */
//             res.status(error.code || 500).json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }
// }

export { asyncHandler };