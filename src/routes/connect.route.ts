import { Router } from 'express'; 
import connectController from '../controllers/connect.controller'; 
import { authJWT } from '../middleware/auth.middleware';

const router = Router(); 

router.get('/accepted', connectController.indexAccepted);
router.get('/:id', authJWT, connectController.show);
router.get('/', authJWT, connectController.index);
router.post('/', connectController.store);
router.patch('/:id', authJWT, connectController.updateStatus);

export default router; 
