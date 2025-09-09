import { Router } from "express";
import multer from "multer";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/post.controller";
import { authJWT } from "../middleware/auth.middleware";

const router = Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 3 },
  ]),
  authJWT,
  createPost
);

router.get("/", getPosts);
router.get("/:id", getPostById);
router.put(
  "/:id",
  authJWT,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  updatePost
);
router.delete("/:id", authJWT, deletePost);

export default router;
