// backend/src/models/Procurement.js
import mongoose from 'mongoose';

const procurementSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true,
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['семена', 'удобрения', 'СЗР', 'ГСМ', 'запчасти', 'оборудование', 'прочее'],
    index: true,
  },
  // Опциональная ссылка на справочник (если ресурс есть в системе)
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceModel',
    required: false,
  },
  resourceModel: {
    type: String,
    enum: ['Fertilizer', 'PlantProtectionProduct', null],
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0,
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

procurementSchema.index({ resourceType: 1, date: -1 });
procurementSchema.index({ date: 1 });

export default mongoose.model('Procurement', procurementSchema);