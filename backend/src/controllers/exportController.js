// backend/src/controllers/exportController.js
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import Sale from '../models/Sale.js';
import Cost from '../models/Cost.js';
import LabourCost from '../models/LabourCost.js';
import CropRotationEntry from '../models/CropRotationEntry.js';
import Field from '../models/Field.js';
import Crop from '../models/Crop.js';

/**
 * POST /api/analytics/export/excel
 * Экспорт отчёта в Excel
 */
export const exportToExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Валидация дат
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, error: 'Некорректные даты' });
    }

    // Создаём workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'АгроПоле';
    workbook.created = new Date();

    // === ЛИСТ 1: Сводка ===
    const summarySheet = workbook.addWorksheet('Сводка');

    // Заголовок
    summarySheet.mergeCells('A1:D1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = `Отчёт за период: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Получаем данные для сводки
    const [revenueResult, costResult, labourResult] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Cost.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]),
      LabourCost.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ])
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalCostFromDb = (costResult[0]?.total || 0) + (labourResult[0]?.total || 0);
    const profit = totalRevenue - totalCostFromDb;
    const profitability = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // Добавляем ключевые показатели
    summarySheet.addRow([]);
    summarySheet.addRow(['Показатель', 'Значение']);
    summarySheet.getRow(3).font = { bold: true };

    summarySheet.addRow(['Выручка', `${totalRevenue.toFixed(2)} руб`]);
    summarySheet.addRow(['Затраты', `${totalCostFromDb.toFixed(2)} руб`]);
    summarySheet.addRow(['Прибыль', `${profit.toFixed(2)} руб`]);
    summarySheet.addRow(['Рентабельность', `${profitability.toFixed(2)} %`]);

    // Форматирование колонок
    summarySheet.getColumn('A').width = 25;
    summarySheet.getColumn('B').width = 20;
    summarySheet.getColumn('B').numFmt = '#,##0.00 "руб"';

    // === ЛИСТ 2: Продажи ===
    const salesSheet = workbook.addWorksheet('Продажи');

    salesSheet.columns = [
      { header: 'Дата', key: 'date', width: 15 },
      { header: 'Культура', key: 'crop', width: 20 },
      { header: 'Количество', key: 'quantity', width: 15 },
      { header: 'Ед.', key: 'unit', width: 8 },
      { header: 'Цена за ед.', key: 'price', width: 15 },
      { header: 'Сумма', key: 'total', width: 15 },
      { header: 'Покупатель', key: 'buyer', width: 25 },
      { header: 'Канал', key: 'channel', width: 15 },
    ];

    const sales = await Sale.find({ date: { $gte: start, $lte: end } })
      .populate('crop', 'name')
      .sort({ date: -1 });

    sales.forEach(sale => {
      salesSheet.addRow({
        date: sale.date.toLocaleDateString(),
        crop: sale.crop?.name || '—',
        quantity: sale.quantity,
        unit: sale.unit,
        price: sale.pricePerUnit,
        total: sale.total,
        buyer: sale.buyer || '—',
        channel: sale.channel,
      });
    });

    // Итог по продажам
    const totalSalesSum = sales.reduce((sum, s) => sum + s.total, 0);
    salesSheet.addRow([]);
    const totalRow = salesSheet.addRow(['Итого:', '', '', '', '', totalSalesSum]);
    totalRow.font = { bold: true };
    totalRow.getCell(6).numFmt = '#,##0.00';

    // Форматирование числовых колонок
    salesSheet.getColumn('quantity').numFmt = '#,##0.00';
    salesSheet.getColumn('price').numFmt = '#,##0.00';
    salesSheet.getColumn('total').numFmt = '#,##0.00';

    // === ЛИСТ 3: Затраты ===
    const costsSheet = workbook.addWorksheet('Затраты');

    costsSheet.columns = [
      { header: 'Дата', key: 'date', width: 15 },
      { header: 'Поле', key: 'field', width: 20 },
      { header: 'Категория', key: 'category', width: 20 },
      { header: 'Наименование', key: 'item', width: 25 },
      { header: 'Кол-во', key: 'quantity', width: 12 },
      { header: 'Ед.', key: 'unit', width: 8 },
      { header: 'Цена', key: 'price', width: 12 },
      { header: 'Сумма', key: 'total', width: 15 },
    ];

    const costs = await Cost.find({ date: { $gte: start, $lte: end } })
      .populate('field', 'name')
      .sort({ date: -1 });

    costs.forEach(cost => {
      costsSheet.addRow({
        date: cost.date.toLocaleDateString(),
        field: cost.field?.name || '—',
        category: cost.category,
        item: cost.item,
        quantity: cost.quantity,
        unit: cost.unit,
        price: cost.pricePerUnit,
        total: cost.totalCost,
      });
    });

    const totalCostsSum = costs.reduce((sum, c) => sum + c.totalCost, 0);
    costsSheet.addRow([]);
    const totalCostRow = costsSheet.addRow(['Итого:', '', '', '', '', '', '', totalCostsSum]);
    totalCostRow.font = { bold: true };
    totalCostRow.getCell(8).numFmt = '#,##0.00';

    costsSheet.getColumn('quantity').numFmt = '#,##0.00';
    costsSheet.getColumn('price').numFmt = '#,##0.00';
    costsSheet.getColumn('total').numFmt = '#,##0.00';

    // === ЛИСТ 4: Урожайность ===
    const yieldSheet = workbook.addWorksheet('Урожайность');

    yieldSheet.columns = [
      { header: 'Поле', key: 'field', width: 20 },
      { header: 'Культура', key: 'crop', width: 20 },
      { header: 'Год', key: 'year', width: 10 },
      { header: 'Урожайность', key: 'yield', width: 15 },
      { header: 'Ед.', key: 'unit', width: 8 },
      { header: 'Дата посева', key: 'sowing', width: 15 },
      { header: 'Дата уборки', key: 'harvest', width: 15 },
    ];

    const yields = await CropRotationEntry.find({
      harvestDate: { $gte: start, $lte: end },
      finalYield: { $gt: 0 }
    })
      .populate('field', 'name')
      .populate('crop', 'name')
      .sort({ harvestDate: -1 });

    yields.forEach(y => {
      yieldSheet.addRow({
        field: y.field?.name || '—',
        crop: y.crop?.name || '—',
        year: y.seasonYear,
        yield: y.finalYield,
        unit: y.yieldUnit,
        sowing: y.sowingDate?.toLocaleDateString() || '—',
        harvest: y.harvestDate?.toLocaleDateString() || '—',
      });
    });

    yieldSheet.getColumn('yield').numFmt = '#,##0.00';

    // Отправляем файл
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/analytics/export/pdf
 * Экспорт отчёта в PDF
 */
export const exportToPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, error: 'Некорректные даты' });
    }

    // Создаём PDF документ
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Устанавливаем заголовки для скачивания
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.pdf`);

    // Подключаем поток вывода в response
    doc.pipe(res);

    // Заголовок
    doc.fontSize(20).text('АгроПоле - Аналитический отчёт', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Период: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Получаем данные (аналогично Excel, но для краткости берём только сводку)
    const [revenueResult, costResult, labourResult] = await Promise.all([
      Sale.aggregate([{ $match: { date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Cost.aggregate([{ $match: { date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$totalCost' } } }]),
      LabourCost.aggregate([{ $match: { date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$totalCost' } } }])
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalCost = (costResult[0]?.total || 0) + (labourResult[0]?.total || 0);
    const profit = totalRevenue - totalCost;
    const profitability = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // Ключевые показатели
    doc.fontSize(14).text('Ключевые показатели', { underline: true });
    doc.moveDown(0.5);

    const startY = doc.y;
    doc.fontSize(12);
    doc.text(`Выручка: ${totalRevenue.toFixed(2)} руб`, 50, startY);
    doc.text(`Затраты: ${totalCost.toFixed(2)} руб`, 50, startY + 20);
    doc.text(`Прибыль: ${profit.toFixed(2)} руб`, 50, startY + 40);
    doc.text(`Рентабельность: ${profitability.toFixed(2)}%`, 50, startY + 60);

    doc.moveDown(4);

    // Топ-10 последних продаж
    doc.fontSize(14).text('Последние продажи', { underline: true });
    doc.moveDown(0.5);

    const sales = await Sale.find({ date: { $gte: start, $lte: end } })
      .populate('crop', 'name')
      .sort({ date: -1 })
      .limit(10);

    // Таблица продаж
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 120;
    const col3 = 200;
    const col4 = 280;
    const col5 = 350;

    doc.fontSize(10);
    doc.text('Дата', col1, tableTop);
    doc.text('Культура', col2, tableTop);
    doc.text('Кол-во', col3, tableTop);
    doc.text('Цена', col4, tableTop);
    doc.text('Сумма', col5, tableTop);

    let y = tableTop + 15;
    sales.forEach(sale => {
      if (y > 700) { // Если не хватает места, добавить новую страницу
        doc.addPage();
        y = 50;
        // Повторить заголовки таблицы на новой странице
        doc.text('Дата', col1, y);
        doc.text('Культура', col2, y);
        doc.text('Кол-во', col3, y);
        doc.text('Цена', col4, y);
        doc.text('Сумма', col5, y);
        y += 15;
      }
      doc.text(sale.date.toLocaleDateString(), col1, y);
      doc.text(sale.crop?.name || '—', col2, y);
      doc.text(`${sale.quantity} ${sale.unit}`, col3, y);
      doc.text(`${sale.pricePerUnit.toFixed(2)} руб`, col4, y);
      doc.text(`${sale.total.toFixed(2)} руб`, col5, y);
      y += 15;
    });

    // Завершаем документ
    doc.end();

  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/analytics/export/custom
 * Кастомный экспорт с выбором формата (прокси на соответствующие функции)
 */
export const customExport = async (req, res) => {
  try {
    const { format } = req.body;
    if (!format || !['excel', 'pdf'].includes(format)) {
      return res.status(400).json({ success: false, error: 'Format must be excel or pdf' });
    }

    if (format === 'excel') {
      return exportToExcel(req, res);
    } else {
      return exportToPDF(req, res);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};