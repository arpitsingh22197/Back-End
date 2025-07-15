import mongoose, { Schema } from "mongoose";
const likeSchema = new mongoose.Schema(
    {  
        video:{
            type:Schema.Types.ObjectId,
            ref: "Video",
        },
        Comment:{
            type:Schema.Types.ObjectId,
            ref: "Comment",
        },
        tweet:{
            type:Schema.Types.ObjectId,
            ref: "Tweet",
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


     },
     {
        timestamps: true
     }
    
)
export const Like = mongoose.model("Like", likeSchema);