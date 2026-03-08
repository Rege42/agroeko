<template>
  <main class="main-content">
    <div class="forecast-form-container">
      <h1 class="form-title">Прогнозирование урожайности</h1>

      <form @submit.prevent="submitForm" class="report-form">
        <!-- Культура -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="icon">🌱</span> Параметры культуры
          </h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="crop-type" class="form-label">Тип культуры</label>
              <select id="crop-type" v-model="form.cropId" class="form-select" required>
                <option value="" disabled>Выберите культуру</option>
                <option v-for="crop in crops" :key="crop._id" :value="crop._id">
                  {{ crop.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="crop-area" class="form-label">Площадь (га)</label>
              <input
                type="number"
                id="crop-area"
                v-model.number="form.area"
                class="form-input"
                min="1"
                required
              />
            </div>
          </div>
        </div>

        <!-- Параметры прогноза -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="icon">🔮</span> Параметры прогноза
          </h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="forecast-model" class="form-label">Модель прогнозирования</label>
              <select id="forecast-model" v-model="form.method" class="form-select">
                <option value="simple_avg">Стандартная (среднее)</option>
                <option value="moving_avg">Скользящее среднее</option>
                <option value="linear_trend">Линейный тренд</option>
              </select>
            </div>
            <div class="form-group">
              <label for="forecast-period" class="form-label">Период прогноза</label>
              <select id="forecast-period" v-model="form.period" class="form-select">
                <option value="1month">1 месяц</option>
                <option value="3months">3 месяца</option>
                <option value="season">Весь сезон</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Дополнительные настройки -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="icon">⚙️</span> Дополнительные настройки
          </h2>
          <div class="form-group">
            <label class="form-checkbox-label">
              <input type="checkbox" v-model="form.includeWeather" class="form-checkbox" />
              <span>Учитывать прогноз погоды</span>
            </label>
          </div>
          <div class="form-group">
            <label class="form-checkbox-label">
              <input type="checkbox" v-model="form.includeSoil" class="form-checkbox" />
              <span>Учитывать состояние почвы</span>
            </label>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="form-actions">
          <router-link to="/forecast" class="form-button secondary">Отмена</router-link>
          <button type="submit" class="form-button primary">Рассчитать прогноз</button>
        </div>
      </form>
    </div>
  </main>
</template>

<script>
import api from '@/services/api';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'ForecastForm',
  setup() {
    const router = useRouter();
    const crops = ref([]);
    const form = ref({
      cropId: '',
      area: 10,
      method: 'linear_trend',
      period: '3months',
      includeWeather: true,
      includeSoil: false,
    });

    // Загрузить список культур при монтировании
    onMounted(async () => {
      try {
        const response = await api.get('/crops'); // нужен эндпоинт для получения культур
        crops.value = response.data.data;
      } catch (error) {
        console.error('Ошибка загрузки культур:', error);
      }
    });

    const submitForm = () => {
      // Переходим на страницу результата, передавая параметры через query
      router.push({
        name: 'ForecastResult',
        query: {
          cropId: form.value.cropId,
          area: form.value.area,
          method: form.value.method,
          period: form.value.period,
          includeWeather: form.value.includeWeather,
          includeSoil: form.value.includeSoil,
        },
      });
    };

    return { crops, form, submitForm };
  },
};
</script>