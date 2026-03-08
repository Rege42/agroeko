// backend/src/models/Cost.js
import mongoose from 'mongoose';

const costSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true,
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: false,
    index: true,
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: false,
    index: true,
  },
  cropRotationEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CropRotationEntry',
    required: false,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'семена',
      'удобрения',
      'СЗР',
      'ГСМ',
      'запчасти',
      'оплата труда',
      'услуги сторонних организаций',
      'амортизация',
      'прочее'
    ],
    index: true,
  },
  item: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  quantity: {
    type: Number,
    min: 0,
    default: 1, // если затрата не в количественном выражении (например, услуга)
  },
  unit: {
    type: String,
    trim: true,
    maxlength: 30,
    default: 'шт',
  },
  pricePerUnit: {
    type: Number,
    min: 0,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
}, {
  timestamps: true,
  versionKey: false,
});

costSchema.index({ category: 1, date: -1 });
costSchema.index({ field: 1, date: -1 });
costSchema.index({ crop: 1, date: -1 });

export default mongoose.model('Cost', costSchema);