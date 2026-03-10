<template>
  <main class="main-content">
    <div class="showcase">
      <div class="showcase-header">
        <h2 class="showcase-title">{{ title }}</h2>
        <span class="showcase-badge">{{ indicatorId }}</span>
      </div>
      <div class="showcase-content">
        <div v-if="loading" class="loading-placeholder">
          <p>Данные загружаются...</p>
          <div class="progress-bar"></div>
        </div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else>
          <!-- Поле поиска -->
          <div class="search-bar">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Поиск по полю..."
              class="standart-input"
            />
          </div>
          <!-- Таблица -->
          <div class="table-wrapper">
            <table class="standart-table">
              <thead>
                <tr>
                  <th
                    v-for="col in columns"
                    :key="col.key"
                    @click="sortBy(col.key)"
                  >
                    {{ col.label }}
                    <span v-if="sortKey === col.key">
                      {{ sortOrder === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredAndSortedData" :key="item._id">
                  <td v-for="col in columns" :key="col.key">
                    {{ formatValue(item, col) }}
                  </td>
                </tr>
                <tr v-if="filteredAndSortedData.length === 0">
                  <td :colspan="columns.length">Нет данных</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';

export default {
  name: 'IndicatorShowcase',
  setup() {
    const route = useRoute();
    const indicatorId = route.params.id;
    const loading = ref(true);
    const error = ref(null);
    const data = ref([]);
    const searchQuery = ref('');
    const sortKey = ref('');
    const sortOrder = ref('asc');

    // Конфигурация для каждого показателя
    const config = {
      yield: {
        title: 'Урожайность',
        endpoint: '/crop-rotation-entries',
        columns: [
          { key: 'fieldName', label: 'Поле' },
          { key: 'cropName', label: 'Культура' },
          { key: 'seasonYear', label: 'Год' },
          { key: 'finalYield', label: 'Урожайность (т/га)' },
        ],
        mapItem: (item) => ({
          _id: item._id,
          fieldName: item.field?.name || '—',
          cropName: item.crop?.name || '—',
          seasonYear: item.seasonYear,
          finalYield: item.finalYield,
        }),
        filterFn: (item, query) =>
          item.fieldName.toLowerCase().includes(query.toLowerCase()),
      },
      ph: {
        title: 'pH почвы',
        endpoint: '/soil-analyses',
        columns: [
          { key: 'fieldName', label: 'Поле' },
          { key: 'analysisDate', label: 'Дата анализа' },
          { key: 'phLevel', label: 'pH' },
        ],
        mapItem: (item) => ({
          _id: item._id,
          fieldName: item.field?.name || '—',
          analysisDate: item.analysisDate,
          phLevel: item.phLevel,
        }),
        filterFn: (item, query) =>
          item.fieldName.toLowerCase().includes(query.toLowerCase()),
      },
      nitrogen: {
        title: 'Азот',
        endpoint: '/soil-analyses',
        columns: [
          { key: 'fieldName', label: 'Поле' },
          { key: 'analysisDate', label: 'Дата анализа' },
          { key: 'nitrogen', label: 'Азот (мг/кг)' },
        ],
        mapItem: (item) => ({
          _id: item._id,
          fieldName: item.field?.name || '—',
          analysisDate: item.analysisDate,
          nitrogen: item.nitrogen,
        }),
        filterFn: (item, query) =>
          item.fieldName.toLowerCase().includes(query.toLowerCase()),
      },
      phosphorus: {
        title: 'Фосфор',
        endpoint: '/soil-analyses',
        columns: [
          { key: 'fieldName', label: 'Поле' },
          { key: 'analysisDate', label: 'Дата анализа' },
          { key: 'phosphorus', label: 'Фосфор (мг/кг)' },
        ],
        mapItem: (item) => ({
          _id: item._id,
          fieldName: item.field?.name || '—',
          analysisDate: item.analysisDate,
          phosphorus: item.phosphorus,
        }),
        filterFn: (item, query) =>
          item.fieldName.toLowerCase().includes(query.toLowerCase()),
      },
      potassium: {
        title: 'Калий',
        endpoint: '/soil-analyses',
        columns: [
          { key: 'fieldName', label: 'Поле' },
          { key: 'analysisDate', label: 'Дата анализа' },
          { key: 'potassium', label: 'Калий (мг/кг)' },
        ],
        mapItem: (item) => ({
          _id: item._id,
          fieldName: item.field?.name || '—',
          analysisDate: item.analysisDate,
          potassium: item.potassium,
        }),
        filterFn: (item, query) =>
          item.fieldName.toLowerCase().includes(query.toLowerCase()),
      },
      humidity: {
        title: 'Влажность почвы',
        endpoint: '/soil-analyses',
        columns: [
          { key: 'fieldName', label: 'Поле' },
          { key: 'analysisDate', label: 'Дата анализа' },
          { key: 'soilMoisture', label: 'Влажность (%)' },
        ],
        mapItem: (item) => ({
          _id: item._id,
          fieldName: item.field?.name || '—',
          analysisDate: item.analysisDate,
          soilMoisture: item.soilMoisture,
        }),
        filterFn: (item, query) =>
          item.fieldName.toLowerCase().includes(query.toLowerCase()),
      },
      temperature: {
        title: 'Температура',
        endpoint: '/weather-observations',
        columns: [
          { key: 'fieldName', label: 'Поле' },
          { key: 'year', label: 'Год' },
          { key: 'averageTemperature', label: 'Ср. температура (°C)' },
        ],
        mapItem: (item) => ({
          _id: item._id,
          fieldName: item.field?.name || '—',
          year: item.year,
          averageTemperature: item.averageTemperature,
        }),
        filterFn: (item, query) =>
          item.fieldName.toLowerCase().includes(query.toLowerCase()),
      },
      illumination: {
        title: 'Освещенность',
        endpoint: null, // данных пока нет
        columns: [],
        mapItem: null,
        filterFn: null,
      },
    };

    const currentConfig = config[indicatorId] || {
      title: 'Показатель',
      endpoint: null,
      columns: [],
    };
    const title = computed(() => currentConfig.title);
    const columns = computed(() => currentConfig.columns || []);

    // Загрузка данных
    const loadData = async () => {
      if (!currentConfig.endpoint) {
        loading.value = false;
        data.value = [];
        return;
      }
      try {
        const response = await api.get(currentConfig.endpoint);
        // Обрабатываем различные форматы ответа
        const items = response.data.data || response.data.items || response.data || [];
        data.value = items.map(currentConfig.mapItem);
      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка загрузки данных';
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadData);

    // Фильтрация
    const filteredData = computed(() => {
      if (!searchQuery.value || !currentConfig.filterFn) return data.value;
      return data.value.filter((item) =>
        currentConfig.filterFn(item, searchQuery.value)
      );
    });

    // Сортировка
    const sortedData = computed(() => {
      if (!sortKey.value) return filteredData.value;
      return [...filteredData.value].sort((a, b) => {
        let aVal = a[sortKey.value];
        let bVal = b[sortKey.value];
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
      });
    });

    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
    };

    const formatValue = (item, col) => {
      const val = item[col.key];
      if (col.key.includes('Date') && val) {
        return new Date(val).toLocaleDateString('ru-RU');
      }
      return val ?? '—';
    };

    return {
      indicatorId,
      loading,
      error,
      title,
      columns,
      searchQuery,
      sortKey,
      sortOrder,
      filteredAndSortedData: sortedData,
      sortBy,
      formatValue,
    };
  },
};
</script>

<style scoped>
.search-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
.search-bar input {
  width: 300px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.table-wrapper {
  overflow-x: auto;
}
.standart-table {
  width: 100%;
  border-collapse: collapse;
}
.standart-table th,
.standart-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.standart-table th {
  background-color: #f2f2f2;
  cursor: pointer;
}
.standart-table th:hover {
  background-color: #e0e0e0;
}
.loading-placeholder {
  text-align: center;
  padding: 50px;
}
.progress-bar {
  width: 60%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 15px auto 0;
  overflow: hidden;
  position: relative;
}
.progress-bar::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 30%;
  background: #7d5c45;
  animation: progress 1.5s ease-in-out infinite;
}
@keyframes progress {
  0% {
    left: -30%;
    width: 30%;
  }
  50% {
    left: 50%;
    width: 40%;
  }
  100% {
    left: 100%;
    width: 30%;
  }
}
.error {
  color: #c62828;
  text-align: center;
  padding: 20px;
}
</style>