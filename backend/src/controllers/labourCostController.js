import LabourCost from '../models/LabourCost.js';

export const createLabourCost = async (req, res) => {
  try {
    const labourCost = new LabourCost(req.body);
    await labourCost.save();
    res.status(201).json({ success: true, data: labourCost });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllLabourCosts = async (req, res) => {
  try {
    const { startDate, endDate, field, operationType } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (field) filter.field = field;
    if (operationType) filter.operationType = operationType;

    const labourCosts = await LabourCost.find(filter)
      .populate('field', 'name')
      .sort({ date: -1 });
    res.json({ success: true, data: labourCosts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLabourCostById = async (req, res) => {
  try {
    const labourCost = await LabourCost.findById(req.params.id)
      .populate('field', 'name');
    if (!labourCost) {
      return res.status(404).json({ success: false, error: 'Затрата на персонал не найдена' });
    }
    res.json({ success: true, data: labourCost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLabourCost = async (req, res) => {
  try {
    const labourCost = await LabourCost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!labourCost) {
      return res.status(404).json({ success: false, error: 'Затрата на персонал не найдена' });
    }
    res.json({ success: true, data: labourCost });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteLabourCost = async (req, res) => {
  try {
    const labourCost = await LabourCost.findByIdAndDelete(req.params.id);
    if (!labourCost) {
      return res.status(404).json({ success: false, error: 'Затрата на персонал не найдена' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};