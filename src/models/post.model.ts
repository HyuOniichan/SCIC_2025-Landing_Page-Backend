import { Schema, model, Document } from "mongoose";

interface Media {
  url: string;
  fileId: string;
}

export interface IPost extends Document {
  title: string;
  content?: string;
  images?: Media[];
  videos?: Media[];
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<Media>(
  {
    url: { type: String, required: true },
    fileId: { type: String, required: true },
  },
  { _id: false }
);

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String },
    images: [mediaSchema],
    videos: [mediaSchema],
  },
  { timestamps: true }
);

export const Post = model<IPost>("Post", postSchema);
