import { Router } from "express";
import { submitTeam, getAllSubmissions, exportExcel, getSubmissionById } from "../controllers/submission.controller";
import multer from "multer";
import { authJWT } from "../middleware/auth.middleware";

const router = Router();
const upload = multer();


router.post(
  "/submit",
  upload.fields([
    { name: "report", maxCount: 1 },
    { name: "attachments", maxCount: 5 },
  ]),
  submitTeam
);
router.get("/",authJWT, getAllSubmissions);
router.get("/export", exportExcel);
router.get("/:id",authJWT, getSubmissionById);

export default router;
