import { Request, Response } from "express";
import userModel from "../models/user.model";
import { USER_STATUS } from "../models/user.model";

class userController {
    // [GET] /connect
    async index(req: Request, res: Response) {
        try {
            const users = await userModel.find({});
            if (users === null) throw new Error("Internal server error");
            if (users && users.length == 0) throw new Error("No users found");

            res.status(200).json({
                status: "success",
                message: "Get users successfully",
                data: users
            })

        } catch (e) {
            res.status(404).json({
                status: "error",
                message: "Users not found",
                errors: {
                    server: e
                }
            })
        }
    }

    // [POST] /connect
    async store(req: Request, res: Response) {
        try {
            const { full_name, email, social_links, school, major, skills, interests } = req.body;
            if (!full_name || !email || !school || !major || (!skills || skills.length == 0)) {
                res.status(400).json({
                    status: "error",
                    message: "Missing information",
                    errors: {
                        full_name: full_name ? 'OK' : 'Missing',
                        email: email ? 'OK' : 'Missing',
                        school: school ? 'OK' : 'Missing',
                        major: major ? 'OK' : 'Missing',
                        skills: skills ? (skills.length? 'OK' : 'Empty') : 'Missing',
                        social_links: 'Not required',
                        interests: 'Not required'
                    }
                })
                return;
            }

            const newUser = new userModel({
                full_name, email, social_links, school, major, skills, interests,
                status: USER_STATUS.pending
            });

            const savedUser = await newUser.save();
            res.status(201).json({
                status: 'success',
                message: 'New connector created',
                data: savedUser
            })
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                errors: {
                    server: e
                }
            })
        }
    }

    // [GET] /connect/accepted
    async indexAccepted(req: Request, res: Response) {
        try {
            const users = await userModel.find({ status: USER_STATUS.accepted });

            if (users == null) throw new Error('Internal server error');
            if (users && users.length == 0) {
                res.status(404).json({
                    status: 'error',
                    message: 'Users not found',
                    errors: {}
                })
                return;
            }

            res.status(200).json({
                status: 'success',
                message: 'All connectors displayed',
                data: users
            })
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                errors: {
                    server: e
                }
            })
        }
    }

    // [GET] /connect/:id
    async show(req: Request, res: Response) {
        try {
            const userId = req.params.id;

            if (!userId) {
                res.status(400).json({
                    status: 'error',
                    message: 'Users not found',
                    errors: {
                        server: 'User ID not provided'
                    }
                })
                return;
            }

            const user = await userModel.findById(req.params.id);

            if (user == null) {
                res.status(404).json({
                    status: 'error',
                    message: 'Users not found',
                    errors: {}
                })
                return;
            }

            res.status(200).json({
                status: 'success',
                message: 'Connector found',
                data: user
            })
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                errors: {
                    server: e
                }
            })
        }
    }

    // [PACTH] /connect/:id
    async updateStatus(req: Request, res: Response) {
        const { status } = req.body;
        const userId = req.params.id;

        const validStatuses = Object.values(USER_STATUS);

        try {
            if (!validStatuses.includes(status)) {
                res.status(400).json({
                    status: 'error',
                    message: 'Failed to update status',
                    errors: {
                        server: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
                    }
                });
                return;
            }

            const updatedUser = await userModel.findByIdAndUpdate(
                userId,
                { status },
                { new: true, runValidators: true }
            )

            if (!updatedUser) {
                res.status(404).json({
                    status: 'error',
                    message: 'User not found',
                    errors: {}
                });
                return; 
            }

            res.status(200).json({
                status: 'success',
                message: 'User status updated',
                data: updatedUser
            })
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                errors: {
                    server: e
                }
            })
        }
    }
}

export default new userController();
