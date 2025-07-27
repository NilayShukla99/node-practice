import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import path from 'path'


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload an image
const uploadFileToCloudinary = async localFileURL => {
    if (!localFileURL) return null;
    try {
        const uploadResult = await cloudinary.uploader
        .upload(
            localFileURL, {
                resource_type: 'auto'
            }
        )
        .then(res => {
            fs.unlinkSync(localFileURL)
            return res;
        })
        .catch((error) => {
            console.log('@cloudinary error: ', error);
        });

        console.log('@cloudinary uploadResult: ', uploadResult);
        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFileURL)
        return null;
    }
}

// remove the uploaded file using public url
const removeFileFromCloudinary = async pubUrl => {
    // extracting the public id from old url
    // const oldPubId = pubUrl.slice(pubUrl.lastIndexOf('/')+1, pubUrl.lastIndexOf('.'))
    // const oldPubId = pubUrl.split('/').pop().split('.')[0];
    const pubId = path.basename(pubUrl, path.extname(pubUrl));
    if (!pubId) return null;
    const response = await cloudinary.uploader
        .destroy(pubId, { resource_type: '' })
        .catch(err => {
            console.error('@cloudinary failed to delete the file. error: ', err)
        })
    console.log('Removed file response: ', response)
    return response;
}

export { uploadFileToCloudinary, removeFileFromCloudinary }