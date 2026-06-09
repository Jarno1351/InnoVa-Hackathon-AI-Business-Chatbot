import { Router } from 'express';
import { handleUserMessage } from '../controllers/chat.controller.js';

const router = Router();

// 💬 POST route for conversational stream interaction
router.post('/message', handleUserMessage);

export default router;