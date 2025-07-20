import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


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
        .then(() => {
            fs.unlinkSync(localFileURL)
        })
        .catch((error) => {
            console.log('@cloudinary error: ', error);
        });

        console.log('@cloudinary uploadResult: ', uploadResult);
    } catch (error) {
        fs.unlinkSync(localFileURL)
    }
}

export { uploadFileToCloudinary }