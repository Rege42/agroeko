// backend/src/models/Plan.js
import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100,
    index: true,
  },
  period: {
    type: String,
    enum: ['год', 'квартал', 'месяц', 'неделя'],
    default: 'год',
  },
  periodValue: {
    type: Number, // номер квартала (1-4), месяца (1-12), недели (1-53)
    min: 1,
    max: 53,
    required: false,
  },
  type: {
    type: String,
    required: true,
    enum: ['revenue', 'cost', 'yield', 'area', 'other'],
    index: true,
  },
  category: {
    type: String, // для cost - статья, для revenue - культура/канал, для yield - культура
    required: true,
    trim: true,
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
  plannedValue: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    trim: true,
    maxlength: 30,
    default: 'руб',
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Уникальность: для одного поля, культуры, типа, периода не может быть двух планов
planSchema.index(
  { year: 1, period: 1, periodValue: 1, type: 1, category: 1, field: 1, crop: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model('Plan', planSchema);