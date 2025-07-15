import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    const uploadOnCloudinary = async (filePath) => {
        try {
            if (!fs.existsSync(filePath)) {
                return null; // Return null if file does not exist
            }
            else {
            const response = await cloudinary.uploader.upload(filePath, { resource_type: 'auto' });

            }
            console.log(`File uploaded successfully: ${filePath}`);
            fs.unlinkSync(filePath); // Delete the file after upload
            return response
            
        } catch (error) {
            fs.unlinkSync(filePath); // Delete the file if upload fails
            return null; // Return null if upload fails
        }
    }
    const deleteFromCloudinary = async (publicId) => {
        try {
            const response = await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
            console.log(`File deleted successfully: ${publicId}`);
            return response;
        } catch (error) {
            console.error(`Error deleting file: ${publicId}`, error);
            return null; // Return null if deletion fails
        }
    }
    export { cloudinary, uploadOnCloudinary };