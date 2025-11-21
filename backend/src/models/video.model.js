import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
    isShort: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["gaming", "music", "education", "entertainment", "sports", "technology", "news", "comedy", "lifestyle", "other"],
      default: "other",
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

//this is used for limit number of video showing 
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
