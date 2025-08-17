import { Router } from 'express'; 
import userController from '../controllers/user.controller'; 
import { authJWT } from '../middleware/auth.middleware';

const router = Router(); 

router.get('/', authJWT, userController.index);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

export default router; 
