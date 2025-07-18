import mongoose ,{Schema} from "mongoose";
const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        videos: [{
            type: Schema.Types.ObjectId,
            ref: "Video"
        }],
        coverImage: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);
export const Playlist = mongoose.model("Playlist", playlistSchema);