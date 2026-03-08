<template>
  <main class="main-content">
    <div v-if="loading" class="loading">Загрузка отчета...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="monthly-report">
      <!-- Заголовок отчета -->
      <div class="report-header">
        <h1 class="report-title">Аналитический отчет</h1>
        <div class="report-meta">
          <span class="report-date">Сформирован: {{ formatDate(report.generatedAt) }}</span>
          <button @click="exportPDF" class="report-download">Скачать PDF</button>
          <button @click="exportExcel" class="report-download">Скачать Excel</button>
        </div>
      </div>

      <!-- Основные показатели -->
      <div class="report-highlights">
        <div class="highlight-card">
          <div class="highlight-value">{{ report.totalArea || 0 }} га</div>
          <div class="highlight-label">Обработано земли</div>
        </div>
        <div class="highlight-card">
          <div class="highlight-value">{{ report.planCompletion || 0 }}%</div>
          <div class="highlight-label">Выполнение плана</div>
        </div>
        <div class="highlight-card">
          <div class="highlight-value">{{ report.avgYield || 0 }} т/га</div>
          <div class="highlight-label">Средняя урожайность</div>
        </div>
      </div>

      <!-- График (заглушка) -->
      <div class="report-section">
        <h2 class="section-title"><span class="icon-graph">📈</span> Динамика урожайности</h2>
        <div class="report-graph placeholder-graph">
          <p>Здесь будет график урожайности по неделям</p>
        </div>
      </div>

      <!-- Таблица данных -->
      <div class="report-section">
        <h2 class="section-title"><span class="icon-table">📊</span> Показатели по культурам</h2>
        <div class="report-table">
          <table>
            <thead>
              <tr>
                <th>Культура</th>
                <th>Площадь (га)</th>
                <th>Урожайность (т/га)</th>
                <th>Отклонение</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in report.cropData" :key="item.crop">
                <td>{{ item.crop }}</td>
                <td>{{ item.area }}</td>
                <td>{{ item.yield }}</td>
                <td :class="getChangeClass(item.deviation)">{{ item.deviation }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Заключение -->
      <div class="report-summary">
        <h2 class="section-title"><span class="icon-summary">📝</span> Заключение агронома</h2>
        <div class="summary-content">
          <p>{{ report.summary || 'Данные отсутствуют' }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

export default {
  name: 'ReportResult',
  setup() {
    const route = useRoute();
    const loading = ref(true);
    const error = ref(null);
    const report = ref({});

    const loadReport = async () => {
      try {
        // Параметры из query
        const params = {
          periodType: route.query.periodType,
          startDate: route.query.startDate,
          endDate: route.query.endDate,
          fields: route.query.fields ? (Array.isArray(route.query.fields) ? route.query.fields : [route.query.fields]) : [],
          reportType: route.query.reportType,
        };
        const response = await api.post('/analytics/report', params);
        report.value = response.data.data;
      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка загрузки отчета';
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadReport);

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return d.toLocaleDateString('ru-RU');
    };

    const getChangeClass = (deviation) => {
      if (deviation > 0) return 'positive';
      if (deviation < 0) return 'negative';
      return 'neutral';
    };

    const exportPDF = () => {
      // Аналогично экспорту из формы
    };

    const exportExcel = () => {
      // Аналогично экспорту из формы
    };

    return {
      loading,
      error,
      report,
      formatDate,
      getChangeClass,
      exportPDF,
      exportExcel,
    };
  },
};
</script>