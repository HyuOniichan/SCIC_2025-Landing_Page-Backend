import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_jwt_key';
const COOKIE_KEY = process.env.COOKIE_JWT_NAME || 'jwt'

// For later auth roles check (needed to update db too)
export type USER_ROLES = {
    ADMIN: 'admin', 
    USER: 'user'
}

export const authJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[COOKIE_KEY];

    if (token) {
        jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, data: any) => {
            if (err) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthenticated: Invalid token',
                    errors: {
                        server: err, 
                        token: token
                    }
                });
            }

            if (!data) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Data not found',
                    errors: {
                        server: err
                    }
                });
            }

            req.body = {
                ...(typeof data === 'object' && data !== null ? data : {}),
                ...req.body
            }

            next();
        });
    } else {
        return res.status(401).json({
            status: 'error',
            message: 'Failed to authenticate',
            errors: {
                server: 'No token provided'
            }
        });
    }
};
