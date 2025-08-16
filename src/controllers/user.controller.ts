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
}

export default new userController();
