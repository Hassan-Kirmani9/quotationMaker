const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    configs: {
      permissions: {
        type: [String],
        default: ["dashboard", "client", "configuration"],
      },
    },
  },
  {
    timestamps: true,
  }
);

tenantSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Tenant", tenantSchema);
