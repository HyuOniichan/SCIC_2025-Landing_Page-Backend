import { Request, Response } from "express";
import { Post } from "../models/post.model";
import {
  uploadFileToImageKit,
  deleteFileFromImageKit,
} from "../utils/imagekit";
import mongoose from "mongoose";

export const getPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching posts" });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error fetching post" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { title, content, removeImages, removeVideos } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Cập nhật title và content
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;

    // Khởi tạo mảng nếu undefined
    post.images = post.images || [];
    post.videos = post.videos || [];

    if (removeImages && !Array.isArray(removeImages)) {
      removeImages = [removeImages];
    }
    if (removeVideos && !Array.isArray(removeVideos)) {
      removeVideos = [removeVideos];
    }

    // Xử lý xóa images
    if (Array.isArray(removeImages)) {
      for (const fileId of removeImages) {
        try {
          await deleteFileFromImageKit(fileId);
        } catch (err) {
          console.warn(
            `Image ${fileId} không còn trên ImageKit, vẫn xóa trong DB.`
          );
        }
        post.images = post.images.filter((img) => img.fileId !== fileId);
      }
    }

    // Xử lý xóa videos
    if (Array.isArray(removeVideos)) {
      for (const fileId of removeVideos) {
        try {
          await deleteFileFromImageKit(fileId);
        } catch (err) {
          console.warn(
            `Video ${fileId} không còn trên ImageKit, vẫn xóa trong DB.`
          );
        }
        post.videos = post.videos.filter((vid) => vid.fileId !== fileId);
      }
    }

    // Xử lý thêm images mới từ multer
    const newImages =
      req.files && "images" in req.files
        ? (req.files["images"] as Express.Multer.File[])
        : [];
    for (const file of newImages) {
      const uploaded = await uploadFileToImageKit(
        file.buffer,
        file.originalname,
        "/posts/images"
      );
      post.images.push(uploaded);
    }

    // Xử lý thêm videos mới từ multer
    const newVideos =
      req.files && "videos" in req.files
        ? (req.files["videos"] as Express.Multer.File[])
        : [];
    for (const file of newVideos) {
      const uploaded = await uploadFileToImageKit(
        file.buffer,
        file.originalname,
        "/posts/videos"
      );
      post.videos.push(uploaded);
    }

    const updatedPost = await post.save();
    return res.status(200).json(updatedPost);
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    console.log("body:", req.body);
    console.log("files:", req.files);

    const { title, content } = req.body;

    let images: { url: string; fileId: string }[] = [];
    let videos: { url: string; fileId: string }[] = [];

    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.images) {
        const uploadedImgs = await Promise.all(
          files.images.map((img) =>
            uploadFileToImageKit(img.buffer, img.originalname, "/posts/images")
          )
        );
        images.push(...uploadedImgs);
      }

      if (files.videos) {
        const uploadedVids = await Promise.all(
          files.videos.map((vid) =>
            uploadFileToImageKit(vid.buffer, vid.originalname, "/posts/videos")
          )
        );
        videos.push(...uploadedVids);
      }
    }

    const newPost = await Post.create({ title, content, images, videos });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Error creating post", details: error });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Kiểm tra id hợp lệ
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    // Tìm và xóa post
    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Xử lý xóa images
    if (deleted.images?.length) {
      for (const img of deleted.images) {
        try {
          await deleteFileFromImageKit(img.fileId);
        } catch {
          console.warn(`Không tìm thấy ảnh ${img.fileId} trên ImageKit, bỏ qua.`);
        }
      }
    }

    // Xử lý xóa videos
    if (deleted.videos?.length) {
      for (const vid of deleted.videos) {
        try {
          await deleteFileFromImageKit(vid.fileId);
        } catch {
          console.warn(`Không tìm thấy video ${vid.fileId} trên ImageKit, bỏ qua.`);
        }
      }
    }

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

