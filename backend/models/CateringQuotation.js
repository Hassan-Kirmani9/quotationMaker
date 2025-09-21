const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const cateringQuotationSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    status: {
      type: String,
      enum: ["quotation", "invoice"],
      default: "quotation",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    // A) Menu Section
    menu: {
      perThaalRate: { type: Number, required: true },
      numberOfThaals: { type: Number, required: true },
      total: { type: Number, required: true },
      items: [
        {
          name: { type: String, required: true },
          amount: { type: Number, default: 0 },
        },
      ],
    },

    // B) Extras Section
    extras: {
      total: { type: Number, default: 0 },
      items: [
        {
          name: { type: String, required: true },
          amount: { type: Number, required: true },
        },
      ],
    },

    // C) Others Section
    others: {
      total: { type: Number, default: 0 },
      items: [
        {
          name: { type: String, required: true },
          amount: { type: Number, required: true },
        },
      ],
    },

    // D) Costing Section
    costing: {
      total: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      advance: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

cateringQuotationSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("CateringQuotation", cateringQuotationSchema);
