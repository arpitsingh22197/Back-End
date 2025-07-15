import mongoose , {Schema} from "mongoose";
const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        subscribedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        }

    },
    {
        timestamps: true
    }
);
export const Subscription = mongoose.model("Subscription", subscriptionSchema);