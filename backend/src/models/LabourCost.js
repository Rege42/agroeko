// backend/src/models/LabourCost.js
import mongoose from 'mongoose';

const labourCostSchema = new mongoose.Schema({
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
  operationType: {
    type: String,
    required: true,
    enum: ['посев', 'уход', 'уборка', 'обработка почвы', 'внесение удобрений', 'опрыскивание', 'прочее'],
    index: true,
  },
  employeeCount: {
    type: Number,
    required: true,
    min: 1,
  },
  hoursWorked: {
    type: Number,
    min: 0,
    default: 8, // можно потом сделать расчёт
  },
  ratePerHour: {
    type: Number,
    required: true,
    min: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
}, {
  timestamps: true,
  versionKey: false,
});

labourCostSchema.index({ field: 1, date: -1 });

export default mongoose.model('LabourCost', labourCostSchema);