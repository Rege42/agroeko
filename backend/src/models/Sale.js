import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  cropRotationEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropRotationEntry',
    required: false, // можно не привязывать, если продажа из разных партий
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    default: 'т',
    trim: true,
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  buyer: {
    type: String,
    trim: true,
  },
  channel: {
    type: String,
    enum: ['опт', 'розница', 'экспорт', 'другое'],
    default: 'другое',
  },
}, {
  timestamps: true,
  versionKey: false,
});

saleSchema.index({ crop: 1, date: -1 });

export default mongoose.model('Sale', saleSchema);