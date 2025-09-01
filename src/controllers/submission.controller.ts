import { Request, Response } from "express";
import { Submission } from "../models/submission.model";
import { uploadFileToImageKit } from "../utils/imagekit";
import nodemailer from "nodemailer";
import ExcelJS from "exceljs";
import mongoose from "mongoose";

// Giới hạn size file (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Hàm gửi email xác nhận
const sendConfirmationEmail = async (
  leaderEmail: string,
  submissionData: any
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const membersList =
    submissionData.members && submissionData.members.length > 0
      ? submissionData.members
          .map(
            (m: any, idx: number) =>
              `<li>${idx + 1}. ${m.fullName} (${m.studentId}) - ${m.email}</li>`
          )
          .join("")
      : "<li>Không có thành viên khác</li>";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h3>[BTC Student Creative Ideas Challenge - SCIC] Xác nhận đăng ký thành công</h3>
      <p>Thân gửi đội thi <strong>${submissionData.teamName}</strong>,</p>

      <p>BTC Cuộc thi <strong>Student Creative Ideas Challenge - SCIC 2025</strong> xin trân trọng thông báo:
      <br>Đơn đăng ký tham gia của đội bạn đã được ghi nhận thành công!</p>

      <h4>Thông tin đội đã đăng ký:</h4>
      <ul>
        <li><strong>Tên dự án/đề tài:</strong> ${
          submissionData.projectName
        }</li>
        <li><strong>Trưởng nhóm:</strong> ${submissionData.leader.fullName} (${
    submissionData.leader.studentId
  }) - ${submissionData.leader.email} ${
    submissionData.leader.phone ? "- " + submissionData.leader.phone : ""
  }</li>
        <li><strong>Các thành viên khác:</strong>
          <ul>
            ${membersList}
          </ul>
        </li>
        <li><strong>Mô tả dự án:</strong> ${
          submissionData.description || "Không có"
        }</li>
        <li><strong>Video (nếu có):</strong> ${
          submissionData.videoLink || "Không có"
        }</li>
        <li><strong>File báo cáo:</strong> ${
          submissionData.report?.url
            ? `<a href="${submissionData.report.url}">Download</a>`
            : "Chưa upload"
        }</li>
        ${
          submissionData.attachments && submissionData.attachments.length > 0
            ? `<li><strong>File đính kèm khác:</strong>
            <ul>
              ${submissionData.attachments
                .map(
                  (f: any) => `<li><a href="${f.url}">${f.fileName}</a></li>`
                )
                .join("")}
            </ul>
          </li>`
            : ""
        }
      </ul>

      <p>Thông tin đội đã được ghi nhận trong hệ thống và sẽ được sử dụng cho quá trình xét duyệt và liên lạc trong suốt cuộc thi.</p>
      <p>Trong thời gian tới, BTC sẽ gửi thêm thông tin chi tiết về timeline, thể lệ và yêu cầu của Vòng đơn qua email này. Nếu đội cần chỉnh sửa thông tin đã đăng ký hoặc có bất kỳ câu hỏi nào, vui lòng liên hệ BTC qua fanpage hoặc phản hồi lại email tới BTC.</p>

      <p>Xin cảm ơn sự quan tâm và tham gia của đội đối với SCIC Quý 3, chúc các bạn chuẩn bị thật tốt cho chặng đường sắp tới!</p>

      <p>Trân trọng,<br/>
      BTC Student Creative Ideas Challenge (SCIC)</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: leaderEmail,
    subject: "[SCIC 2025] Xác nhận đăng ký thành công",
    html: htmlContent,
  });
};

// Nộp bài
export const submitTeam = async (req: Request, res: Response) => {
  try {
    const { teamName, projectName, leader, members, description, videoLink } =
      req.body;

    // Validation cơ bản
    if (!teamName || !projectName || !leader) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc: teamName, projectName, leader",
      });
    }

    // Parse JSON nếu leader hoặc members là string
    let leaderObj, membersArr;
    const safeTeamName = teamName.replace(/[^a-zA-Z0-9-_]/g, "_");

    try {
      leaderObj = typeof leader === "string" ? JSON.parse(leader) : leader;
      membersArr =
        typeof members === "string" ? JSON.parse(members) : members || [];
    } catch {
      return res
        .status(400)
        .json({ message: "leader hoặc members không hợp lệ" });
    }

    // Validation leader
    if (!leaderObj?.fullName || !leaderObj?.studentId || !leaderObj?.email) {
      return res.status(400).json({
        message: "Thông tin trưởng nhóm không đầy đủ",
      });
    }

    const files: any = {};
    const uploadedFiles = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    // Upload report (bắt buộc theo model)
    if (uploadedFiles?.report && uploadedFiles.report.length > 0) {
      const reportFile = uploadedFiles.report[0];
      if (reportFile.size > MAX_FILE_SIZE)
        return res
          .status(400)
          .json({ message: "File báo cáo quá lớn (>100MB)" });
      const uploadedReport = await uploadFileToImageKit(
        reportFile.buffer,
        reportFile.originalname,
        `/submissions/${safeTeamName}/reports`
      );

      // Đảm bảo có đủ field theo model
      files.report = {
        url: uploadedReport.url,
        fileId: uploadedReport.fileId,
        fileName: reportFile.originalname, // ← Thêm fileName từ original file
      };
    } else {
      return res.status(400).json({
        message: "File báo cáo là bắt buộc",
      });
    }

    // Upload attachments (không bắt buộc)
    if (uploadedFiles?.attachments && uploadedFiles.attachments.length > 0) {
      files.attachments = [];
      for (const f of uploadedFiles.attachments) {
        if (f.size > MAX_FILE_SIZE)
          return res
            .status(400)
            .json({ message: `File ${f.originalname} quá lớn (>100MB)` });
        const uploaded = await uploadFileToImageKit(
          f.buffer,
          f.originalname,
          `/submissions/${safeTeamName}/attachments`
        );

        files.attachments.push({
          url: uploaded.url,
          fileId: uploaded.fileId,
          fileName: f.originalname // ← Thêm fileName từ original file
        });
      }
    }

    // Kiểm tra tên team đã tồn tại chưa
    const existingSubmission = await Submission.findOne({ teamName });
    if (existingSubmission) {
      return res.status(400).json({
        message: "Tên đội đã tồn tại, vui lòng chọn tên khác",
      });
    }

    const submission = await Submission.create({
      teamName,
      projectName,
      leader: leaderObj,
      members: membersArr,
      description,
      videoLink,
      report: files.report,
      attachments: files.attachments || [],
      createdAt: new Date(),
    });

    // Gửi email xác nhận
    try {
      await sendConfirmationEmail(leaderObj.email, submission);
    } catch (emailError) {
      console.error("Lỗi gửi email:", emailError);
      return res.status(201).json({
        message: "Nộp bài thành công, nhưng có lỗi khi gửi email xác nhận",
        submission,
      });
    }

    res.status(201).json({ message: "Nộp bài thành công", submission });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách bài dự thi
export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Xem chi tiết 1 bài dự thi
export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const submission = await Submission.findById(id);
    if (!submission)
      return res.status(404).json({ message: "Không tìm thấy bài dự thi" });
    res.json(submission);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Xuất Excel
export const exportExcel = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    
    if (submissions.length === 0) {
      return res.status(404).json({ message: "Không có dữ liệu để xuất" });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Submissions");

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Setup columns
    sheet.columns = [
      { header: "Team Name", key: "teamName", width: 25 },
      { header: "Project Name", key: "projectName", width: 35 },
      { header: "Leader Name", key: "leaderName", width: 25 },
      { header: "Leader Email", key: "leaderEmail", width: 35 },
      { header: "Leader Student ID", key: "leaderStudentId", width: 18 },
      { header: "Leader Phone", key: "leaderPhone", width: 15 },
      { header: "Members", key: "members", width: 60 },
      { header: "Description", key: "description", width: 50 },
      { header: "Report File URL", key: "report", width: 50 },
      { header: "Video Link", key: "videoLink", width: 50 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // Add data
    submissions.forEach((s: any) => {
      sheet.addRow({
        teamName: s.teamName || "",
        projectName: s.projectName || "",
        leaderName: s.leader?.fullName || "",
        leaderEmail: s.leader?.email || "",
        leaderStudentId: s.leader?.studentId || "",
        leaderPhone: s.leader?.phone || "",
        members:
          s.members && s.members.length > 0
            ? s.members
                .map((m: any) => `${m.fullName} (${m.studentId}) - ${m.email}`)
                .join("; ")
            : "Không có thành viên khác",
        description: s.description || "Không có",
        report: s.report?.url || "Chưa upload",
        videoLink: s.videoLink || "Không có",
        createdAt: s.createdAt ? new Date(s.createdAt).toLocaleString('vi-VN') : "",
      });
    });

    // Auto-fit columns
    sheet.columns.forEach(column => {
      if (column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, (cell) => {
          const columnLength = cell.value ? String(cell.value).length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength > 60 ? 60 : maxLength;
      }
    });

    // CRITICAL: Set headers for automatic file download
    res.setHeader(
      'Content-Type', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    
    // Force download với tên file cố định
    res.setHeader(
      'Content-Disposition', 
      'attachment; filename="submissions.xlsx"'
    );
    
    // Additional headers to ensure proper download
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // Write Excel file to response stream
    await workbook.xlsx.write(res);
    
    // End response
    res.end();
    
    console.log(`Excel file exported successfully: submissions.xlsx`);
    
  } catch (err: any) {
    console.error('Export Excel Error:', err);
    
    // Make sure headers haven't been sent before sending JSON error
    if (!res.headersSent) {
      res.status(500).json({ 
        message: "Lỗi server khi xuất Excel", 
        error: err.message 
      });
    }
  }
};
