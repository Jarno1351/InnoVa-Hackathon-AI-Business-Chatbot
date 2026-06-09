import { Router } from 'express';
import { createBranch, getMyBranches } from '../controllers/branch.controller.js';
import { requireLogin } from '../middleware/auth.middleware.js'; // 🔒 Protecting it

const router = Router();

router.use(requireLogin); 

router.post('/add', createBranch);
router.get('/all', getMyBranches);

export default router;