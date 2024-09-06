import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const imageSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    imgurl: {
      type: String, // url from cloudinary
      required: true,
    },

    description: {
      type: String,
      require: true,
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


imageSchema.plugin(mongooseAggregatePaginate)

export const Image = mongoose.model("Image", imageSchema);
