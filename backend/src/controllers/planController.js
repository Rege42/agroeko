import Plan from '../models/Plan.js';

export const createPlan = async (req, res) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const { year, period, type, field, crop } = req.query;
    const filter = {};
    if (year) filter.year = year;
    if (period) filter.period = period;
    if (type) filter.type = type;
    if (field) filter.field = field;
    if (crop) filter.crop = crop;

    const plans = await Plan.find(filter)
      .populate('field', 'name')
      .populate('crop', 'name')
      .sort({ year: -1, periodValue: 1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('field', 'name')
      .populate('crop', 'name');
    if (!plan) {
      return res.status(404).json({ success: false, error: 'План не найден' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'План не найден' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'План не найден' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};