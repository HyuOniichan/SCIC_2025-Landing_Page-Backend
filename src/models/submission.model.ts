import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
    team_name: string, 
    project_title: string, 
    project_description: string, 
    caption_info: string, 
    members_info: Array<string>, 
    slide_url: string, 
    video_url: string, 
    other_files_url: Array<string>, 
}

const submissionSchema = new Schema({
    team_name: { type: String, required: true }, 
    project_title: { type: String, required: true }, 
    project_description: { type: String }, 
    caption_info: { type: Schema.Types.ObjectId, ref: 'User' }, 
    members_info: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
    slide_url: { type: String, required: true }, 
    video_url: { type: String }, 
    other_files_url: [{ type: String }]
}, {
    timestamps: true
})

export default mongoose.model<ISubmission>('Submission', submissionSchema); 
