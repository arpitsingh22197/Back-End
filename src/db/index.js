import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
       const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}${DB_NAME}` )
       console.log(`Connected to MongoDB at ${process.env.MONGO_URI}/${DB_NAME}`);
       
        console.log(`Database connected successfully to ${DB_NAME}`);
        console.log(`${connectionInstance.connection.host}`);
        
        
        
        
    }
    catch(err){
        console.error("Error connecting to the database:", err);
        process.exit(1); // Exit the process with failure
    }
}
export default connectDB;