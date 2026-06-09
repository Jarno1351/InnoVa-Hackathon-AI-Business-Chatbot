import { Service } from "../models/Service.model.js";
import { Branch } from "../models/Branch.model.js";

// 🛠️ ADD NEW SERVICE WITH EMBEDDING PIPELINE LINK
export const addServiceItem = async (req, res) => {
    try {
        const { branchId, name, price } = req.body;
        const businessId = req.user.businessId; // Extracted from token middleware

        // Structural field integrity check
        if (!branchId || !name || price === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: "branchId, service name, and price are required parameters." 
            });
        }

        // Fetch branch details and deep-populate business details
        const targetBranch = await Branch.findById(branchId).populate('businessId');
        if (!targetBranch) {
            return res.status(404).json({ success: false, message: "Target operational branch location not found." });
        }

        const companyName = targetBranch.businessId.companyName;
        const branchName = targetBranch.branchName;

        // 🧠 Strategic Context String (Labelled explicitly as a Service)
        const textChunk = `Service Name: ${name} | Price: ${Number(price)} PHP | Company Name: ${companyName} | Operational Location: ${branchName} Branch`;

        let vectorEmbedding = [];
        try {
            // 🎯 FIXED: Changed path from '/api/v1/ai/embed' to '/api/v1/embed'
            const response = await fetch('http://localhost:8000/api/v1/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textChunk }) 
            });
            
            const aiPayload = await response.json();
            if (aiPayload.success) {
                vectorEmbedding = aiPayload.embedding; // Maps seamlessly to "embedding" from Flask response
            } else {
                console.error("⚠️ Flask embedding failed:", aiPayload.error);
            }
        } catch (aiErr) {
            console.error("⚠️ AI Microservice unreachable. Saving document shell raw...", aiErr.message);
        }

        // Instantiating matching metadata blocks for LangChain pre-filtering targets
        const newService = new Service({
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

        await newService.save();
        return res.status(201).json({ success: true, data: newService });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to persist service item.", error: error.message });
    }
};

// 📂 FETCH ALL SERVICES UNDER SPECIFIC OPERATIONAL BRANCH
export const getBranchServices = async (req, res) => {
    try {
        const { branchId } = req.params;
        const services = await Service.find({ branchId });
        
        return res.status(200).json({ 
            success: true, 
            count: services.length, 
            data: services 
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};