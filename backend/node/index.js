import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Import Your Main Operational Route Modules
import authRouter from './routes/auth.route.js';
import branchRouter from './routes/branch.route.js';
import supplyRouter from './routes/supply.route.js';
import serviceRouter from './routes/service.route.js';
import chatRouter from './routes/chat.route.js'

// 🎯 Inline Import Mongoose Models directly for the cleanup endpoint
import { Supply } from './models/Supply.model.js';
import { Service } from './models/Service.model.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Main Chat Gateway Route System
app.use('/api/chat', chatRouter);
app.use('/api/auth', authRouter);
app.use('/api/branch', branchRouter);
app.use('/api/supply', supplyRouter);
app.use('/api/service', serviceRouter);

// ⚠️ PRODUCTION FLUSH UTILITY (Clears both Supplies and Services at once)
app.delete('/api/production/danger/clear-catalog', async (req, res) => {
    try {
        const securityCheck = req.headers['x-production-secure-key'];
        
        // Anti-accident logic gate validation check
        if (securityCheck !== 'WIPE_DATA_CONFIRMED_2026') {
            return res.status(403).json({
                success: false,
                message: "Access Denied. Invalid or missing production backup security token key."
            });
        }

        // Execute deletions across both target collections simultaneously
        const [supplyDeleteReport, serviceDeleteReport] = await Promise.all([
            Supply.deleteMany({}),
            Service.deleteMany({})
        ]);
        
        return res.status(200).json({
            success: true,
            message: "Production catalog collections successfully flushed and reset.",
            summary: {
                suppliesRemoved: supplyDeleteReport.deletedCount,
                servicesRemoved: serviceDeleteReport.deletedCount
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Critical internal error encountered during sandbox wipe pipeline.",
            error: error.message 
        });
    }
});

// Base Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: "Valencia Engine Core is active." });
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
};

startServer();