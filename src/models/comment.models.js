import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const CommentSchema = new Schema(
   
    { 
        content:{
            type: String,
            required: true,
            trim: true
        },
        video:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        
    },
    {
        timestamps: true
    })
CommentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("Comment", CommentSchema);
