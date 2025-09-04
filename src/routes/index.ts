import { Application, Request, Response } from "express";
import userRoute from './user.route'; 
import connectRoute from './connect.route'; 
import postRoute from './post.route'
import submitRoute from './submission.route'

function route(app: Application) {
    const prefix = '/api/v1'; 

    app.use(`${prefix}/posts`, postRoute); 
    app.use(`${prefix}/submissions`, submitRoute);     
    app.use(`${prefix}/user`, userRoute); 
    app.use(`${prefix}/connect`, connectRoute); 

    app.use(`${prefix}/health`, (req: Request, res: Response) => {
        res.status(200).json({
            status: 'ok', 
            message: 'Server is running'
        })
    })
}

export default route; 
