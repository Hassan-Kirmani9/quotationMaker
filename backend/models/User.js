const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: false
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    return next(error);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

userSchema.post("save", async function (doc, next) {
  try {
    const Configuration = mongoose.model("Configuration");
    const exists = await Configuration.findOne({ user: doc._id });
    if (!exists) {
      await Configuration.create({ user: doc._id });
    }
  } catch (err) {
    console.error('Error creating configuration:', err);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);