import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['merchant', 'admin'], default: 'merchant' },
        businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null }
    },
    { timestamps: true }
);

export const User = mongoose.model('User', userSchema);