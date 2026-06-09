import { Router } from 'express';
import { registerBusiness, getProfile, loginUser } from '../controllers/auth.controller.js';
import { requireLogin } from '../middleware/auth.middleware.js'; // 🎯 Import the gatekeeper

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerBusiness);

// 🔒 Passing requireLogin means getProfile won't execute unless the token is fully valid
router.get('/profile', requireLogin, getProfile); 

export default router;  