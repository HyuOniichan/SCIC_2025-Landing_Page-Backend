import { Request, Response } from "express";
import userModel from "../models/user.model";

class userController {
    // [GET] /user
    async index(req: Request, res: Response) {
        try {
            const users = await userModel.find({});
            if (users === null) throw new Error("Get /user failed");

            res.status(200).json({
                status: "success",
                message: "Get users successfully",
                data: users
            })

        } catch (e) {
            res.status(400).json({
                status: "error",
                message: "Users not found",
                errors: {
                    server: e
                }
            })
        }
    }

    // [GET] /user/me
    async getCurrentUser(req: Request, res: Response) {
        try {
            const { email, id } = req.body;
            if (!email && !id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User not found',
                    errors: {
                        server: 'No user info in token'
                    }
                });
            }

            const user = await userModel.findOne({ $or: [{ email }, { _id: id }] }).select('-password');
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found',
                    errors: {}
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Current user fetched successfully',
                data: user
            });
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
                errors: { server: e }
            });
        }
    }

    // [POST] /user/register
    async register(req: Request, res: Response) {
        try {
            const { full_name, mssv, email, password, social_links, school, major, skills } = req.body;

            const existingUser = await userModel.findOne({
                $or: [{ email }, { mssv }]
            });
            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User already exists',
                    errors: {}
                });
            }

            const hashedPassword = await require('bcryptjs').hash(password, 10);
            const user = new userModel({ full_name, mssv, email, password: hashedPassword, social_links, school, major, skills });
            await user.save();

            res.status(201).json({
                status: 'success',
                message: 'User registered successfully',
                data: { full_name, mssv, email, social_links, school, major, skills }
            });
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
                errors: {
                    server: e
                }
            });
        }
    }

    // [POST] /user/login
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await userModel.findOne({ email });
            if (!user || !user.password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User not found',
                    errors: {}
                });
            }

            const isMatch = await require('bcryptjs').compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Wrong password',
                    errors: {
                        server: 'Invalid credentials'
                    }
                });
            }

            const token = require('jsonwebtoken').sign(
                { id: user._id, email: user.email },
                process.env.JWT_ACCESS_SECRET || 'super_secret_jwt_key',
                { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
            );

            res.cookie(process.env.COOKIE_JWT_NAME || 'jwt', token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000
            })

            res.status(201).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user._id,
                        full_name: user.full_name,
                        mssv: user.mssv,
                        email: user.email,
                        social_links: user.social_links,
                        school: user.school,
                        major: user.major,
                        skills: user.skills
                    }
                }
            });
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
                errors: {
                    server: e || 'Unknown error'
                }
            });
        }
    }

    // [POST] /user/login
    async logout(req: Request, res: Response) {
        res.cookie(process.env.COOKIE_JWT_NAME || 'jwt', '', { maxAge: 0 });
        res.status(201).json({
            status: 'success',
            message: 'Logout successful',
            data: {}
        });
    }
}

export default new userController();
