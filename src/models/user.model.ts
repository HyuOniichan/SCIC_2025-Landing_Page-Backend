import mongoose, { Schema, Document } from "mongoose";

export enum USER_STATUS {
    accepted = 'accepted',
    pending = 'pending',
    rejected = 'rejected'
}

export interface IUser extends Document {
    full_name: string,
    email: string,
    social_links: Array<string>,
    school: string,
    major: string,
    skills: Array<string>,
}

const UserSchema: Schema = new Schema({
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    social_links: [{
        type: {
            type: String,
            required: true
        },
        link: {
            type: String,
            required: true
        }
    }],
    school: { type: String },
    major: { type: String },
    skills: {
        type: [String],
        validate: {
            validator: function (arr: string[]) {
                return Array.isArray(arr) && arr.length > 0
            },
            message: 'Skills must have at least one item'
        },
        required: true
    },
    interests: { type: String },
    status: {
        type: String,
        enum: Object.values(USER_STATUS),
        default: USER_STATUS.pending
    }
}, {
    timestamps: true
})

export default mongoose.model<IUser>('User', UserSchema); 
