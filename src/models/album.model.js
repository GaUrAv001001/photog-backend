import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const albumSchema = new Schema(
    {
        name: {
            type:String,
            required:true,
            trim:true,
            index:true,
        },

        images:[
            {
            type:Schema.Types.ObjectId,
            ref:"Image",
        },
        ],

        isDeleted: {
            type: Boolean,
            default: false,
          },

        createdBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
    },

    {
        timestamps:true,
    }
)

export const Album = mongoose.model("Album", albumSchema);