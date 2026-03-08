import Sale from '../models/Sale.js';

// Создать продажу
export const createSale = async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Получить все продажи (с поддержкой фильтрации по датам, полю, культуре)
export const getAllSales = async (req, res) => {
  try {
    const { startDate, endDate, field, crop, channel } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (field) filter.field = field;
    if (crop) filter.crop = crop;
    if (channel) filter.channel = channel;

    const sales = await Sale.find(filter)
      .populate('crop', 'name')
      .populate('field', 'name')
      .sort({ date: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Получить одну продажу по ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('crop', 'name')
      .populate('field', 'name');
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Продажа не найдена' });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Обновить продажу
export const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Продажа не найдена' });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Удалить продажу
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, error: 'Продажа не найдена' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};