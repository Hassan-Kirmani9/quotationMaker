const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const quotationItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  discountValue: {
    type: Number,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

quotationItemSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNo: {
      type: String,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    items: [quotationItemSchema],
    subtotal: {
      type: Number,
    },
    discountType: {
      type: String,
    },
    discountValue: {
      type: Number,
    },
    discountAmount: {
      type: Number,
    },
    taxRate: {
      type: Number,
    },
    taxAmount: {
      type: Number,
    },
    totalAmount: {
      type: Number,
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
  },
  {
    timestamps: true,
  }
);

quotationSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Quotation", quotationSchema);
