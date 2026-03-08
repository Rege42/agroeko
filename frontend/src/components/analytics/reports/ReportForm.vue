<template>
  <main class="main-content">
    <div class="report-form-container">
      <h1 class="form-title">Параметры отчета</h1>

      <form @submit.prevent="submitForm" class="report-form">
        <!-- Секция выбора периода -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="icon">📅</span> Период анализа
          </h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="period-type" class="form-label">Тип периода</label>
              <select id="period-type" v-model="form.periodType" class="form-select">
                <option value="day">День</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
                <option value="quarter">Квартал</option>
                <option value="year">Год</option>
                <option value="custom">Произвольный</option>
              </select>
            </div>

            <div class="form-group">
              <label for="start-date" class="form-label">Начальная дата</label>
              <input
                type="date"
                id="start-date"
                v-model="form.startDate"
                class="form-input"
                :required="form.periodType === 'custom'"
              />
            </div>

            <div class="form-group">
              <label for="end-date" class="form-label">Конечная дата</label>
              <input
                type="date"
                id="end-date"
                v-model="form.endDate"
                class="form-input"
                :required="form.periodType === 'custom'"
              />
            </div>
          </div>
        </div>

        <!-- Секция выбора полей -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="icon">🌾</span> Выбор полей
          </h2>
          <div class="form-group">
            <div class="form-checkbox-group">
              <label class="form-checkbox-label">
                <input type="checkbox" v-model="selectAllFields" @change="toggleAllFields" class="form-checkbox" />
                <span>Все поля</span>
              </label>
            </div>
            <div class="form-scrollable">
              <div v-for="field in fields" :key="field._id" class="form-checkbox-group">
                <label class="form-checkbox-label">
                  <input
                    type="checkbox"
                    v-model="selectedFields"
                    :value="field._id"
                    class="form-checkbox"
                  />
                  <span>{{ field.name }} ({{ field.crop || '—' }})</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Секция дополнительных параметров -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="icon">⚙️</span> Дополнительные параметры
          </h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="report-type" class="form-label">Тип отчета</label>
              <select id="report-type" v-model="form.reportType" class="form-select">
                <option value="standard">Стандартный</option>
                <option value="detailed">Детализированный</option>
                <option value="technical">Технический</option>
              </select>
            </div>

            <div class="form-group">
              <label for="format" class="form-label">Формат вывода</label>
              <select id="format" v-model="form.format" class="form-select">
                <option value="web">Веб-страница</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="form-actions">
          <router-link to="/reports" class="form-button secondary">Отмена</router-link>
          <button type="submit" class="form-button primary">Сформировать</button>
        </div>
      </form>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

export default {
  name: 'ReportForm',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const fields = ref([]);
    const selectedFields = ref([]);
    const selectAllFields = ref(false);

    const form = ref({
      periodType: route.query.type || 'month', // по умолчанию из query или 'month'
      startDate: '',
      endDate: '',
      reportType: 'standard',
      format: 'web',
    });

    // Загрузка списка полей
    const loadFields = async () => {
      try {
        const response = await api.get('/fields'); // нужен эндпоинт для полей
        fields.value = response.data.data;
        // По умолчанию выбираем все поля
        selectedFields.value = fields.value.map(f => f._id);
        selectAllFields.value = true;
      } catch (error) {
        console.error('Ошибка загрузки полей:', error);
      }
    };

    // Выбрать/снять все поля
    const toggleAllFields = () => {
      if (selectAllFields.value) {
        selectedFields.value = fields.value.map(f => f._id);
      } else {
        selectedFields.value = [];
      }
    };

    // Следим за изменением выбранных полей для обновления чекбокса "Все поля"
    const updateSelectAll = () => {
      selectAllFields.value = selectedFields.value.length === fields.value.length;
    };

    onMounted(loadFields);

    const submitForm = () => {
      // Формируем параметры для запроса
      const params = {
        periodType: form.value.periodType,
        startDate: form.value.startDate,
        endDate: form.value.endDate,
        fields: selectedFields.value,
        reportType: form.value.reportType,
        format: form.value.format,
      };

      if (form.value.format === 'web') {
        // Для веб-формата переходим на страницу результата с параметрами
        router.push({
          name: 'ReportResult',
          query: params,
        });
      } else {
        // Для PDF/Excel вызываем экспорт
        exportReport(params);
      }
    };

    const exportReport = async (params) => {
      try {
        const endpoint = params.format === 'pdf' ? '/analytics/export/pdf' : '/analytics/export/excel';
        const response = await api.post(endpoint, params, {
          responseType: 'blob', // важно для получения файла
        });
        // Создаём ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report.${params.format === 'pdf' ? 'pdf' : 'xlsx'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Ошибка экспорта:', error);
      }
    };

    return {
      fields,
      selectedFields,
      selectAllFields,
      form,
      toggleAllFields,
      updateSelectAll,
      submitForm,
    };
  },
};
</script>