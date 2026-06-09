import { Router } from 'express';
import { addSupplyItem, getBranchSupplies } from '../controllers/supply.controller.js';
import { requireLogin } from '../middleware/auth.middleware.js';

const router = Router();

// Protect item registration, keeping query methods open for branch-wide catalog rendering
router.post('/add', requireLogin, addSupplyItem);
router.get('/branch/:branchId', getBranchSupplies);

export default router;