import { Router } from 'express';
import { addServiceItem, getBranchServices } from '../controllers/service.controller.js';
import { requireLogin } from '../middleware/auth.middleware.js';

const router = Router();

// Protect addition requests with login token verification middleware
router.post('/add', requireLogin, addServiceItem);
router.get('/branch/:branchId', getBranchServices);

export default router;