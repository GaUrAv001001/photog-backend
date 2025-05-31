import {v2 as cloudinary} from "cloudinary"
// import cloudinary from "cloudinary"
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
        console.log("vldnvkndjkvbjkdbvkjdbvksbvdksjb", localImagePath)

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localImagePath, {
            resource_type:"auto"
        })
        // const response = await cloudinary.v2.uploader.upload(localImagePath, {
        //     resource_type:"auto"
        // })
        if(response){
            console.log("cloudinary response not: ",response)
        }

        // file has been upload successfully
        fs.unlinkSync(localImagePath)

        return response;

    } catch (error) {
        fs.unlinkSync(localImagePath) 
        // console.log("cloudinary response: ",response)
        console.log("error: ", error)
        return null;
    }
}

export {uploadOnCloudinary};

