import express, { Router } from 'express'; 
import connectController from '../controllers/connect.controller'; 
import { authJWT } from '../middleware/auth.middleware';

const router = Router(); 
const jsonParser = express.json()

router.get('/accepted', connectController.indexAccepted);
router.get('/:id', authJWT, connectController.show);
router.get('/', authJWT, connectController.index);
router.post('/',jsonParser, connectController.store);
router.patch('/:id', authJWT, jsonParser, connectController.updateStatus);

export default router; 
