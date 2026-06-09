import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        companyName: { type: String, required: true, trim: true },
        category: { type: String, required: true }, // e.g., "IT Supplies", "Hardware"
        tinNumber: { type: String, trim: true, default: "" },
        status: { type: String, enum: ['pending', 'active'], default: 'active' }
    },
    { timestamps: true }
);

export const Business = mongoose.model('Business', businessSchema);