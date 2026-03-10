<template>
  <main class="main-content">
    <div v-if="loading" class="loading">Загрузка отчета...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="monthly-report">
      <!-- Заголовок -->
      <div class="report-header">
        <h1 class="report-title">Аналитический отчет</h1>
        <div class="report-meta">
          <span class="report-date">Сформирован: {{ formatDate(new Date()) }}</span>
          <button @click="exportPDF" class="report-download">PDF</button>
          <button @click="exportExcel" class="report-download">Excel</button>
        </div>
      </div>

      <!-- Блок с продажами -->
      <div class="report-section" v-if="report.financial?.revenue?.length">
        <h2 class="section-title">Выручка (продажи)</h2>
        <div class="report-table">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Культура</th>
                <th>Кол-во (т)</th>
                <th>Цена за т</th>
                <th>Сумма (руб)</th>
                <th>Покупатель</th>
                <th>Канал</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in report.financial.revenue" :key="item._id">
                <td>{{ formatDate(item.date) }}</td>
                <td>{{ item.cropName }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.pricePerUnit.toFixed(2) }}</td>
                <td>{{ item.total.toFixed(2) }}</td>
                <td>{{ item.buyer }}</td>
                <td>{{ item.channel }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Блок с затратами -->
      <div class="report-section" v-if="report.financial?.costs?.length">
        <h2 class="section-title">Затраты</h2>
        <div class="report-table">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Поле</th>
                <th>Категория</th>
                <th>Наименование</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Сумма (руб)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in report.financial.costs" :key="item._id">
                <td>{{ formatDate(item.date) }}</td>
                <td>{{ item.fieldName || '—' }}</td>
                <td>{{ item.category }}</td>
                <td>{{ item.item }}</td>
                <td>{{ item.quantity }} {{ item.unit }}</td>
                <td>{{ item.pricePerUnit.toFixed(2) }}</td>
                <td>{{ item.totalCost.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Блок с урожайностью (если есть) -->
      <div class="report-section" v-if="report.production?.length">
        <h2 class="section-title">Урожайность</h2>
        <div class="report-table">
          <table>
            <thead>
              <tr>
                <th>Поле</th>
                <th>Культура</th>
                <th>Год</th>
                <th>Урожайность (т/га)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in report.production" :key="item._id">
                <td>{{ item.fieldName }}</td>
                <td>{{ item.cropName }}</td>
                <td>{{ item.seasonYear }}</td>
                <td>{{ item.finalYield }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Сообщение, если нет данных -->
      <div v-if="!report.financial?.revenue?.length && !report.financial?.costs?.length && !report.production?.length"
        class="no-data">
        <p>За выбранный период данные отсутствуют.</p>
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
        const params = {
          periodType: route.query.periodType,
          startDate: route.query.startDate,
          endDate: route.query.endDate,
          fields: route.query.fields ? (Array.isArray(route.query.fields) ? route.query.fields : [route.query.fields]) : [],
          reportType: route.query.reportType,
        };
        const response = await api.post('/analytics/report', params);
        console.log('Ответ от сервера:', response.data); // для отладки
        report.value = response.data.data;
      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка загрузки отчета';
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadReport);

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU');
    };

    const exportReport = async (format) => {
      try {
        const params = {
          periodType: route.query.periodType,
          startDate: route.query.startDate,
          endDate: route.query.endDate,
          fields: route.query.fields ? (Array.isArray(route.query.fields) ? route.query.fields : [route.query.fields]) : [],
          reportType: route.query.reportType,
        };

        const response = await api.post(`/analytics/export/${format}`, params, {
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error(`Ошибка экспорта в ${format}:`, err);
        alert(`Не удалось экспортировать отчёт в ${format.toUpperCase()}`);
      }
    };

    const exportPDF = () => exportReport('pdf');
    const exportExcel = () => exportReport('excel');

    return {
      loading,
      error,
      report,
      formatDate,
      exportPDF,
      exportExcel,
    };
  },
};
</script>

<style scoped>
.loading,
.error,
.no-data {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.error {
  color: #c62828;
}

.report-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f5f5f5;
}
</style>