import Procurement from '../models/Procurement.js';

export const createProcurement = async (req, res) => {
  try {
    const procurement = new Procurement(req.body);
    await procurement.save();
    res.status(201).json({ success: true, data: procurement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllProcurements = async (req, res) => {
  try {
    const { startDate, endDate, resourceType, supplier } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (resourceType) filter.resourceType = resourceType;
    if (supplier) filter.supplier = supplier;

    const procurements = await Procurement.find(filter).sort({ date: -1 });
    res.json({ success: true, data: procurements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProcurementById = async (req, res) => {
  try {
    const procurement = await Procurement.findById(req.params.id);
    if (!procurement) {
      return res.status(404).json({ success: false, error: 'Закупка не найдена' });
    }
    res.json({ success: true, data: procurement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProcurement = async (req, res) => {
  try {
    const procurement = await Procurement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!procurement) {
      return res.status(404).json({ success: false, error: 'Закупка не найдена' });
    }
    res.json({ success: true, data: procurement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteProcurement = async (req, res) => {
  try {
    const procurement = await Procurement.findByIdAndDelete(req.params.id);
    if (!procurement) {
      return res.status(404).json({ success: false, error: 'Закупка не найдена' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};