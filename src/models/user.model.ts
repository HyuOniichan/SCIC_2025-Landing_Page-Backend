import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    full_name: string,
    mssv: string, 
    email: string, 
    social_links: Array<string>, 
    school: string, 
    major: string, 
    skills: Array<string>, 
}

const UserSchema: Schema = new Schema({
    full_name: { type: String, required: true, trim: true },
    mssv: { type: String, required: true, trim: true }, 
    email: { type: String, required: true, trim: true, unique: true }, 
    social_links: [{ type: String }], 
    school: { type: String }, 
    major: { type: String }, 
    skills: [{ type: String }], 
}, {
    timestamps: true
})

export default mongoose.model<IUser>('User', UserSchema); 
