import mongoose, { Schema, Document } from "mongoose";

export interface Member {
  fullName: string;
  studentId: string;
  email: string;
  phone?: string;
}

export interface FileInfo {
  url: string;
  fileId: string;
  fileName: string;
}

export interface SubmissionDocument extends Document {
  teamName: string;
  projectName: string;
  leader: Member;
  members: Member[];
  description?: string;
  report?: FileInfo;
  attachments?: FileInfo[];
  videoLink?: string;
  createdAt: Date;
}

const MemberSchema = new Schema<Member>({
  fullName: { 
    type: String, 
    required: [true, "Họ tên là bắt buộc"],
    trim: true 
  },
  studentId: { 
    type: String, 
    required: [true, "Mã số sinh viên là bắt buộc"],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email là bắt buộc"],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email không hợp lệ"]
  },
  phone: { 
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ"]
  },
});

const FileInfoSchema = new Schema<FileInfo>({
  url: { 
    type: String, 
    required: [true, "URL file là bắt buộc"] 
  },
  fileId: { 
    type: String, 
    required: [true, "File ID là bắt buộc"] 
  },
  fileName: { 
    type: String, 
    required: [true, "Tên file là bắt buộc"] 
  },
});

const SubmissionSchema = new Schema<SubmissionDocument>({
  teamName: { 
    type: String, 
    required: [true, "Tên đội là bắt buộc"],
    trim: true,
    unique: true,
    index: true
  },
  projectName: { 
    type: String, 
    required: [true, "Tên dự án là bắt buộc"],
    trim: true 
  },
  leader: { 
    type: MemberSchema, 
    required: [true, "Thông tin trưởng nhóm là bắt buộc"] 
  },
  members: { 
    type: [MemberSchema], 
    default: [],
    validate: {
      validator: function(members: Member[]) {
        const studentIds = members.map(m => m.studentId);
        const emails = members.map(m => m.email);
        return new Set(studentIds).size === studentIds.length && 
               new Set(emails).size === emails.length;
      },
      message: "Không được có thành viên trùng mã số sinh viên hoặc email"
    }
  },
  description: { 
    type: String,
    trim: true 
  },
  report: { 
    type: FileInfoSchema, 
    required: false 
  },
  attachments: { 
    type: [FileInfoSchema], 
    default: [] 
  },
  videoLink: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; 
        return /^https?:\/\/.+/.test(v);
      },
      message: "Link video phải là URL hợp lệ"
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
}, {
  timestamps: true, 
});

SubmissionSchema.pre('save', function(next) {
  const leaderEmail = this.leader.email;
  const leaderStudentId = this.leader.studentId;
  
  if (this.members.some((m: Member) => 
    m.email === leaderEmail || m.studentId === leaderStudentId
  )) {
    return next(new Error("Trưởng nhóm không được trùng với thành viên"));
  }
  
  next();
});

export const Submission = mongoose.model<SubmissionDocument>("Submission", SubmissionSchema);