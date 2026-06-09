import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Business',
            required: [true, 'A branch must belong to a business']
        },
        branchName: {
            type: String,
            required: [true, 'Please enter branch name'],
            trim: true
        },
        contactNumber: {
            type: String,
            trim: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: [true, 'Please enter branch coordinates [longitude, latitude]']
            }
        }
    },
    {
        timestamps: true
    }
);

// 🌍 Index for finding branches near a user geospatially
branchSchema.index({ location: "2dsphere" });
branchSchema.index({ businessId: 1 }); // Added for fast lookups when loading merchant dashboards

export const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema);