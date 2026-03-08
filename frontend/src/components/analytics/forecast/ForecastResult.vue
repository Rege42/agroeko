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
          <div class="highlight-value">{{ forecast.scenarios.average.value }} {{ forecast.scenarios.average.unit }}</div>
          <div class="highlight-label">Средний прогноз</div>
          <div class="highlight-change" :class="getChangeClass(forecast.scenarios.average.change)">
            {{ forecast.scenarios.average.change }}
          </div>
        </div>
        <div class="highlight-card">
          <div class="highlight-value">{{ forecast.scenarios.optimistic.value }} {{ forecast.scenarios.optimistic.unit }}</div>
          <div class="highlight-label">Оптимистичный</div>
        </div>
        <div class="highlight-card warning">
          <div class="highlight-value">{{ forecast.scenarios.pessimistic.value }} {{ forecast.scenarios.pessimistic.unit }}</div>
          <div class="highlight-label">Пессимистичный</div>
        </div>
      </div>

      <!-- График (простейший placeholder, можно добавить Chart.js) -->
      <div class="forecast-section">
        <h2 class="section-title">Динамика урожайности</h2>
        <div class="forecast-chart placeholder">
          <!-- Здесь можно добавить график -->
          <p>График будет здесь</p>
        </div>
      </div>

      <!-- Факторы и рекомендации (если есть в ответе) -->
      <div v-if="forecast.factors" class="forecast-details">
        <div class="details-section">
          <h2 class="section-title">Факторы влияния</h2>
          <div class="factors-list">
            <div
              v-for="factor in forecast.factors"
              :key="factor.name"
              class="factor"
              :class="factor.impact"
            >
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { forecast } from '@/services/api';

export default {
  name: 'ForecastResult',
  setup() {
    const route = useRoute();
    const loading = ref(true);
    const error = ref(null);
    const forecastData = ref({});

    const loadForecast = async () => {
      try {
        const { cropId, method, period } = route.query;
        // Для прогноза урожайности используем getYieldForecast
        const response = await forecast.getYieldForecast(cropId, method);
        // Добавляем дополнительные поля из query (площадь, период и т.д.)
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
      if (change.startsWith('+')) return 'positive';
      if (change.startsWith('-')) return 'negative';
      return '';
    };

    const exportPDF = () => {
      // Вызов эндпоинта экспорта с нужными параметрами
    };

    const exportExcel = () => {
      // Вызов эндпоинта экспорта
    };

    return {
      loading,
      error,
      forecast: forecastData,
      formatDate,
      getChangeClass,
      exportPDF,
      exportExcel,
    };
  },
};
</script>