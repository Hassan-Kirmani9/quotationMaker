const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            enum: ['starter', 'gold', 'diamond']
        }
    },
    {
        timestamps: true,
    }
);

planSchema.pre(['find', 'findOne', 'findOneAndUpdate'], async function () {
    try {
        const Plan = this.model;
        const existingPlans = await Plan.countDocuments();

        if (existingPlans === 0) {
            const plans = [
                { name: 'starter' },
                { name: 'gold' },
                { name: 'diamond' }
            ];

            await Plan.insertMany(plans);
            console.log('Plans auto-created');
        }
    } catch (error) {
        console.error('Error auto-creating plans:', error);
    }
});

module.exports = mongoose.model("Plan", planSchema);