const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Size name is required'],
    trim: true,
    maxlength: [50, 'Size name cannot exceed 50 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});


sizeSchema.index({ name: 1, user: 1 }, { unique: true });


sizeSchema.index({ name: 'text' });

module.exports = mongoose.model('Size', sizeSchema);