import { Supply } from "../models/Supply.model.js";
import { Branch } from "../models/Branch.model.js";

export const addSupplyItem = async (req, res) => {
    try {
        const { branchId, name, price } = req.body;
        const businessId = req.user.businessId; 

        if (!branchId || !name || price === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: "branchId, supply name, and price are required parameters." 
            });
        }

        const targetBranch = await Branch.findById(branchId).populate('businessId');
        if (!targetBranch) {
            return res.status(404).json({ success: false, message: "Target operational branch location not found." });
        }

        const companyName = targetBranch.businessId.companyName;
        const branchName = targetBranch.branchName;

        const textChunk = `Supply Name: ${name} | Price: ${Number(price)} PHP | Company Name: ${companyName} | Operational Location: ${branchName} Branch`;

        let vectorEmbedding = [];
        try {
            // 🎯 FIXED: Removed the extra /ai/ from the URL string
            const response = await fetch('http://localhost:8000/api/v1/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textChunk }) 
            });
            
            const aiPayload = await response.json();
            if (aiPayload.success) {
                vectorEmbedding = aiPayload.embedding;
            } else {
                console.error("⚠️ Flask embedding failed:", aiPayload.error);
            }
        } catch (aiErr) {
            console.error("⚠️ AI Microservice unreachable. Saving document shell raw...", aiErr.message);
        }

        const newSupply = new Supply({
            businessId,
            branchId,
            name,
            price: Number(price),
            textChunk, 
            vectorEmbedding,
            metadata: {
                businessId,
                branchId,
                price: Number(price)
            }
        });

        await newSupply.save();
        return res.status(201).json({ success: true, data: newSupply });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to persist supply item.", error: error.message });
    }
};

export const getBranchSupplies = async (req, res) => {
    try {
        const { branchId } = req.params;
        const supplies = await Supply.find({ branchId });
        
        return res.status(200).json({ 
            success: true, 
            count: supplies.length, 
            data: supplies 
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};