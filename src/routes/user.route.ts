import express from 'express';
import { Router } from 'express'; 
import userController from '../controllers/user.controller'; 
import { authJWT } from '../middleware/auth.middleware';

const router = Router(); 
const jsonParser = express.json({ limit: "50mb" })

router.get('/', authJWT, userController.index);
router.post('/login',jsonParser, userController.login);
router.post('/logout', userController.logout);

export default router; 
