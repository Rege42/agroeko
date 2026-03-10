<template>
  <main class="main-content">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="forecast-report">
      <!-- Шапка -->
      <div class="forecast-header">
        <div class="header-content">
          <h1 class="report-title">Прогноз урожайности {{ forecast.crop }}</h1>
          <div class="report-subtitle">{{ forecast.period }}</div>
          <div class="report-meta">
            <span class="meta-item">Сформирован: {{ formatDate(forecast.generatedAt) }}</span>
            <span class="meta-item">Модель: {{ forecast.model }}</span>
            <span class="meta-item">Площадь: {{ forecast.area || '—' }} га</span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="exportPDF" class="download-btn">PDF</button>
          <button @click="exportExcel" class="download-btn">Excel</button>
        </div>
      </div>

      <!-- Основные показатели -->
      <div class="forecast-highlights">
        <div class="highlight-card primary">
          <div class="highlight-value">{{ forecast.scenarios.average.value }} {{ forecast.scenarios.average.unit }}
          </div>
          <div class="highlight-label">Средний прогноз</div>
          <div class="highlight-change" :class="getChangeClass(forecast.scenarios.average.change)">
            {{ forecast.scenarios.average.change }}
          </div>
        </div>
        <div class="highlight-card">
          <div class="highlight-value">{{ forecast.scenarios.optimistic.value }} {{ forecast.scenarios.optimistic.unit
          }}</div>
          <div class="highlight-label">Оптимистичный</div>
        </div>
        <div class="highlight-card warning">
          <div class="highlight-value">{{ forecast.scenarios.pessimistic.value }} {{ forecast.scenarios.pessimistic.unit
          }}</div>
          <div class="highlight-label">Пессимистичный</div>
        </div>
      </div>

      <!-- График -->
      <div class="forecast-section">
        <h2 class="section-title">Динамика урожайности</h2>
        <div class="forecast-chart">
          <canvas ref="canvasRef" width="400" height="200"></canvas>
        </div>
      </div>

      <!-- Факторы и рекомендации -->
      <div v-if="forecast.factors" class="forecast-details">
        <div class="details-section">
          <h2 class="section-title">Факторы влияния</h2>
          <div class="factors-list">
            <div v-for="factor in forecast.factors" :key="factor.name" class="factor" :class="factor.impact">
              <div class="factor-icon">{{ factor.impact === 'positive' ? '+' : '-' }}</div>
              <div class="factor-content">
                <h3>{{ factor.name }}</h3>
                <p>{{ factor.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="forecast.recommendations" class="details-section">
        <h2 class="section-title">Рекомендации</h2>
        <div class="recommendations">
          <div v-for="rec in forecast.recommendations" :key="rec" class="recommendation">
            <div class="recommendation-icon">💡</div>
            <p>{{ rec }}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { forecast } from '@/services/api';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default {
  name: 'ForecastResult',
  setup() {
    const route = useRoute();
    const loading = ref(true);
    const error = ref(null);
    const forecastData = ref({});
    const canvasRef = ref(null);
    const chartRef = ref(null);

    const renderChart = (historical) => {
      if (!canvasRef.value) return;
      if (chartRef.value) chartRef.value.destroy();
      const ctx = canvasRef.value.getContext('2d');
      chartRef.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: historical.map(item => item.year),
          datasets: [{
            label: 'Урожайность (т/га)',
            data: historical.map(item => item.yield),
            borderColor: '#5a3921',
            backgroundColor: 'rgba(125, 92, 69, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            pointBackgroundColor: '#5a3921',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            fill: true,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, title: { display: true, text: 'т/га' } } },
          plugins: { legend: { display: true } },
        },
      });
    };

    watchEffect(() => {
      if (canvasRef.value && forecastData.value.historical?.length) {
        renderChart(forecastData.value.historical);
      }
    });

    const loadForecast = async () => {
      try {
        const { cropId, method, period } = route.query;
        const response = await forecast.getYieldForecast(cropId, method);
        forecastData.value = {
          ...response.data.data,
          area: route.query.area,
          period: period === '1month' ? '1 месяц' : period === '3months' ? '3 месяца' : 'Весь сезон',
        };
      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка загрузки прогноза';
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadForecast);

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return d.toLocaleDateString('ru-RU');
    };

    const getChangeClass = (change) => {
      if (change?.startsWith('+')) return 'positive';
      if (change?.startsWith('-')) return 'negative';
      return '';
    };

    // Экспорт в PDF
    const exportPDF = () => {
      const doc = new jsPDF();

      // Регистрируем обычный и жирный шрифты
      try {
        doc.addFont('/fonts/DejaVuSans.ttf', 'DejaVuSans', 'normal');
        doc.addFont('/fonts/DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');
        doc.setFont('DejaVuSans'); // устанавливаем обычный как основной
      } catch (e) {
        console.error('Ошибка загрузки шрифта:', e);
        doc.setFont('helvetica'); // запасной вариант
      }

      const data = forecastData.value;

      // Заголовок документа
      doc.setFontSize(16);
      doc.text(`Прогноз урожайности ${data.crop}`, 14, 20);
      doc.setFontSize(10);
      doc.text(`Сформирован: ${formatDate(data.generatedAt)}`, 14, 30);
      doc.text(`Модель: ${data.model}`, 14, 36);
      if (data.area) doc.text(`Площадь: ${data.area} га`, 14, 42);

      // Сценарии
      let y = 50;
      doc.setFontSize(12);
      doc.text('Прогнозные сценарии:', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`• Средний: ${data.scenarios.average.value} ${data.scenarios.average.unit} (${data.scenarios.average.change})`, 14, y);
      y += 6;
      doc.text(`• Оптимистичный: ${data.scenarios.optimistic.value} ${data.scenarios.optimistic.unit}`, 14, y);
      y += 6;
      doc.text(`• Пессимистичный: ${data.scenarios.pessimistic.value} ${data.scenarios.pessimistic.unit}`, 14, y);

      // Таблица исторических данных
      if (data.historical?.length) {
        y += 10;
        doc.setFontSize(12);
        doc.text('Историческая урожайность:', 14, y);
        y += 5;
        const tableData = data.historical.map(item => [item.year, item.yield.toFixed(2)]);
        autoTable(doc, {
          startY: y + 2,
          head: [['Год', 'Урожайность (т/га)']],
          body: tableData,
          styles: { font: 'DejaVuSans' },
          headStyles: { font: 'DejaVuSans', fontStyle: 'bold' },
          bodyStyles: { font: 'DejaVuSans' },
        });
      }

      doc.save(`forecast_${data.crop}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    // Экспорт в Excel
    const exportExcel = () => {
      const data = forecastData.value;

      // Создаём рабочую книгу и лист
      const wb = XLSX.utils.book_new();
      const wsData = [];

      // Заголовок
      wsData.push(['Прогноз урожайности', data.crop]);
      wsData.push([]);
      wsData.push(['Сформирован', formatDate(data.generatedAt)]);
      wsData.push(['Модель', data.model]);
      if (data.area) wsData.push(['Площадь (га)', data.area]);
      wsData.push([]);

      // Сценарии
      wsData.push(['Сценарий', 'Значение', 'Ед. изм.', 'Изменение']);
      wsData.push(['Средний', data.scenarios.average.value, data.scenarios.average.unit, data.scenarios.average.change]);
      wsData.push(['Оптимистичный', data.scenarios.optimistic.value, data.scenarios.optimistic.unit, '']);
      wsData.push(['Пессимистичный', data.scenarios.pessimistic.value, data.scenarios.pessimistic.unit, '']);
      wsData.push([]);

      // Исторические данные
      if (data.historical?.length) {
        wsData.push(['Историческая урожайность']);
        wsData.push(['Год', 'Урожайность (т/га)']);
        data.historical.forEach(item => {
          wsData.push([item.year, item.yield]);
        });
      }

      // Факторы и рекомендации
      if (data.factors?.length) {
        wsData.push([]);
        wsData.push(['Факторы влияния']);
        wsData.push(['Фактор', 'Влияние', 'Описание']);
        data.factors.forEach(f => {
          wsData.push([f.name, f.impact === 'positive' ? 'Положительное' : 'Отрицательное', f.description]);
        });
      }

      if (data.recommendations?.length) {
        wsData.push([]);
        wsData.push(['Рекомендации']);
        data.recommendations.forEach(rec => {
          wsData.push([rec]);
        });
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Прогноз');
      XLSX.writeFile(wb, `forecast_${data.crop}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    onUnmounted(() => {
      if (chartRef.value) chartRef.value.destroy();
    });

    return {
      loading,
      error,
      forecast: forecastData,
      canvasRef,
      formatDate,
      getChangeClass,
      exportPDF,
      exportExcel,
    };
  },
};
</script>

<style scoped>
.forecast-chart {
  height: 300px;
  width: 100%;
  position: relative;
}
</style>