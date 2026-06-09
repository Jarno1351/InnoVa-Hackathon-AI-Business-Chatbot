import jwt from 'jsonwebtoken';

export const requireLogin = async (req, res, next) => {
    try {
        // 1. Extract token from Authorization header (Format: Bearer <token>)
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: "Access denied. No authentication token provided.",
                uiTrigger: "REDIRECT_TO_LOGIN"
            });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify token legitimacy
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'VALENCIA_ENGINE_TEMP_SECRET_KEY');

        // 3. Inject verified identity credentials into the request state context
        req.user = {
            id: decoded.userId,
            businessId: decoded.businessId,
            role: decoded.role
        };

        // 4. Proceed smoothly to your controller handler logic
        next();

    } catch (error) {
        // Handle expiration or tampering explicitly
        return res.status(401).json({ 
            success: false, 
            message: "Authentication session expired or invalid. Please re-authenticate.",
            error: error.message 
        });
    }
};