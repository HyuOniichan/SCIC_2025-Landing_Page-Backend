import { Router } from 'express'; 
import userController from '../controllers/user.controller'; 
import { authJWT } from '../middleware/auth.middleware';

const router = Router(); 

router.get('/', authJWT, userController.index);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/me', authJWT, userController.getCurrentUser);

export default router; 
