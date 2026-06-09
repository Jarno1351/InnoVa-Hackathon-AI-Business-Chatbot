import { User } from '../models/User.model.js';
import { Business } from '../models/Business.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 📝 REGISTER BUSINESS & MERCHANT
export const registerBusiness = async (req, res) => {
    try {
        const { name, email, password, companyName, category } = req.body;

        // Validation Check
        if (!name || !email || !password || !companyName || !category) {
            return res.status(400).json({ success: false, message: "All initialization fields are required." });
        }

        // Duplicate Check
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email is already registered." });
        }

        // 1. Hash Password Safely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Instantiate User Shell
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'merchant'
        });

        // 3. Instantiate Linked Business Record
        const newBusiness = new Business({
            ownerId: newUser._id,
            companyName,
            category
        });

        // 4. Dual Sync Reference Links & Commit to Atlas
        newUser.businessId = newBusiness._id;
        
        await newBusiness.save();
        await newUser.save();

        // 5. Build Auth Session State Token
        const token = jwt.sign(
            { userId: newUser._id, businessId: newBusiness._id, role: newUser.role },
            process.env.JWT_SECRET || 'VALENCIA_ENGINE_TEMP_SECRET_KEY',
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: "Merchant account and Business profile created successfully!",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                businessId: newUser.businessId
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server registration failure.", error: error.message });
    }
};

// 🔐 GET PROFILE (Hydrated Dashboard Payload)
export const getProfile = async (req, res) => {
    try {
        // 🎯 Pulled completely from verified middleware session context!
        const userId = req.user.id; 

        const userProfile = await User.findById(userId)
            .select('-password')
            .populate('businessId');

        if (!userProfile) {
            return res.status(404).json({ success: false, message: "Profile metadata records not found." });
        }

        return res.status(200).json({
            success: true,
            data: userProfile
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to resolve profile mapping data.", error: error.message });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation Check
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password fields are required." });
        }

        // 1. Locate User inside Atlas
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid authentication credentials." });
        }

        // 2. Compare Password Hashes Natively
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid authentication credentials." });
        }

        // 3. Issue Fresh Upstream Session Token
        const token = jwt.sign(
            { userId: user._id, businessId: user.businessId, role: user.role },
            process.env.JWT_SECRET || 'VALENCIA_ENGINE_TEMP_SECRET_KEY',
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: "Authentication successful. Welcome back!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                businessId: user.businessId,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server authentication failure.", error: error.message });
    }
};