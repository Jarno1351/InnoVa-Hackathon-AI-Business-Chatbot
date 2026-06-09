import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, default: 0 },
        textChunk: { type: String, trim: true },
        vectorEmbedding: { type: [Number], default: [] },
        
        // 🎯 LangChain MongoDB Atlas Vector Search Pre-Filter Target
        metadata: {
            businessId: { type: mongoose.Schema.Types.ObjectId },
            branchId: { type: mongoose.Schema.Types.ObjectId },
            price: { type: Number }
        }
    },
    { timestamps: true }
);

serviceSchema.index({ branchId: 1 });
serviceSchema.index({ businessId: 1 });

export const Service = mongoose.model('Service', serviceSchema);