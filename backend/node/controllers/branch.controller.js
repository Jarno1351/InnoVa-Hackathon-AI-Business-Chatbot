import { Branch } from '../models/Branch.model.js';

export const createBranch = async (req, res) => {
    try {
        const { branchName, contactNumber, longitude, latitude } = req.body;
        const businessId = req.user.businessId; // 🎯 Securely grabbed from your requireLogin middleware!

        if (!branchName || !longitude || !latitude) {
            return res.status(400).json({ 
                success: false, 
                message: "Branch name and both spatial coordinates [longitude, latitude] are required." 
            });
        }

        const newBranch = new Branch({
            businessId,
            branchName,
            contactNumber,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)] // GeoJSON expects numbers
            }
        });

        await newBranch.save();

        return res.status(201).json({
            success: true,
            message: "Operational branch location pinned successfully!",
            data: newBranch
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Failed to initialize branch location.", 
            error: error.message 
        });
    }
};

// 🗺️ GET ALL BRANCHES FOR LOGGED IN MERCHANT
export const getMyBranches = async (req, res) => {
    try {
        const branches = await Branch.find({ businessId: req.user.businessId });
        return res.status(200).json({ success: true, data: branches });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};