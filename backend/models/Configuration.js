const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const configurationSchema = new mongoose.Schema(
  {
    bank: {
      name: { type: String },
      accountName: { type: String },
      accountNumber: { type: String },
    },
    business: {
      name: { type: String },
      nameColor: { type: String },
      address: { type: String },
      mobileNum: { type: String },
      businessNum: { type: String },
      email: { type: String },
      web: { type: String },
      logo: { type: String },
      taxId: { type: String },
      currency: { type: String, required: true, default: "PKR" },
    },
    quotation: {
      validity: { type: Number, required: true, default: 30 },
      terms: { type: String },
      prefix: { type: String, required: true, default: "QUO" },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

configurationSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Configuration", configurationSchema);
