import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
    title: string, 
    content: string, 
    images_url: Array<string>, 
    videos_url: Array<string>, 
}

const postSchema = new Schema({
    title: { type: String, required: true }, 
    content: { type: String }, 
    images_url: [{ type: String }], 
    videos_url: [{ type: String }], 
}, {
    timestamps: true
})

export default mongoose.model('Post', postSchema); 
