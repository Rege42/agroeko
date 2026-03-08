import Cost from '../models/Cost.js';

export const createCost = async (req, res) => {
  try {
    const cost = new Cost(req.body);
    await cost.save();
    res.status(201).json({ success: true, data: cost });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllCosts = async (req, res) => {
  try {
    const { startDate, endDate, field, crop, category } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (field) filter.field = field;
    if (crop) filter.crop = crop;
    if (category) filter.category = category;

    const costs = await Cost.find(filter)
      .populate('field', 'name')
      .populate('crop', 'name')
      .sort({ date: -1 });
    res.json({ success: true, data: costs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCostById = async (req, res) => {
  try {
    const cost = await Cost.findById(req.params.id)
      .populate('field', 'name')
      .populate('crop', 'name');
    if (!cost) {
      return res.status(404).json({ success: false, error: 'Затрата не найдена' });
    }
    res.json({ success: true, data: cost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCost = async (req, res) => {
  try {
    const cost = await Cost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cost) {
      return res.status(404).json({ success: false, error: 'Затрата не найдена' });
    }
    res.json({ success: true, data: cost });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteCost = async (req, res) => {
  try {
    const cost = await Cost.findByIdAndDelete(req.params.id);
    if (!cost) {
      return res.status(404).json({ success: false, error: 'Затрата не найдена' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};