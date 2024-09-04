import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_API_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRETE 
});

const uploadOnCloudinary = async(localImagePath)=>{
    try {
        if(!localImagePath) return null

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localImagePath, {
            resource_type:"auto"
        })

        // file has been upload successfully
        console.log("Coludinary Response: ",response)
        console.log("file is uploaded on clodinary", response.url);

        return response;

    } catch (error) {
        fs.unlinkSync(localImagePath) // remove the locally saves temp file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary};