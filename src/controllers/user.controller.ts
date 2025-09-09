import { Request, Response } from "express";
import userModel from "../models/user.model";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

class userController {
  // [GET] /user
  async index(req: Request, res: Response) {
    try {
      const users = await userModel.find({});
      if (users === null) throw new Error("Get /user failed");

      res.status(200).json({
        status: "success",
        message: "Get users successfully",
        data: users,
      });
    } catch (e) {
      res.status(400).json({
        status: "error",
        message: "Users not found",
        errors: {
          server: e,
        },
      });
    }
  }

  // [POST] /user/login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const isMatch = email == ADMIN_EMAIL && password == ADMIN_PASSWORD;

      if (!isMatch) {
        res.status(400).json({
          status: "error",
          message: "Wrong email or password",
          errors: {
            server: "Invalid credentials",
          },
        });
        return;
      }

      const token = require("jsonwebtoken").sign(
        { email: email },
        process.env.JWT_ACCESS_SECRET || "super_secret_jwt_key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
      );

      res.cookie(process.env.COOKIE_JWT_NAME || "jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60 * 1000,
      });

      res.status(201).json({
        status: "success",
        message: "Login successful",
        data: {
          token,
          email,
        },
      });
    } catch (e) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        errors: {
          server: e || "Unknown error",
        },
      });
    }
  }

  // [POST] /user/login
  async logout(req: Request, res: Response) {
    res.cookie(process.env.COOKIE_JWT_NAME || "jwt", "", { maxAge: 0 });
    res.status(201).json({
      status: "success",
      message: "Logout successful",
      data: {},
    });
  }
}

export default new userController();
