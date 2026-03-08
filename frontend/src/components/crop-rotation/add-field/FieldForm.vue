<template>
  <div class="form-container">
    <form class="soil-form" @submit.prevent="saveField">
      <div class="form-group">
        <label for="name">Название:</label>
        <input type="text" id="name" v-model="field.name" class="standart-input" required />
        <button type="submit" class="standart-button">Сохранить</button>
      </div>

      <div class="form-group">
        <label for="area">Площадь (га):</label>
        <input type="number" id="area" v-model.number="field.area" class="standart-input" step="0.01" required />
      </div>
      <div class="form-group">
        <label for="precipitation">Осадки (мм):</label>
        <input type="number" id="precipitation" v-model.number="field.precipitation" class="standart-input" />
      </div>

      <div class="form-group">
        <label for="humidity">Влажность (%):</label>
        <input type="number" id="humidity" v-model.number="field.humidity" class="standart-input" step="0.01" />
      </div>
      <div class="form-group">
        <label for="temperature">Средняя температура (°C):</label>
        <input type="number" id="temperature" v-model.number="field.temperature" class="standart-input" step="0.01" />
      </div>

      <div class="form-group">
        <label for="ph">pH почвы:</label>
        <input type="number" id="ph" v-model.number="field.ph" class="standart-input" step="0.1" />
      </div>
      <div class="form-group">
        <label for="nutrients">Уровень питательных веществ:</label>
        <select id="nutrients" v-model="field.nutrients" class="standart-input">
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
      </div>

      <div class="form-group">
        <label for="organic">Содержание органики (%):</label>
        <input type="number" id="organic" v-model.number="field.organic" class="standart-input" step="0.01" />
      </div>
      <div class="form-group">
        <label for="soil-type">Тип почвы:</label>
        <select id="soil-type" v-model="field.soilType" class="standart-input">
          <option value="sandy">Песчаная</option>
          <option value="loamy">Суглинистая</option>
          <option value="clay">Глинистая</option>
        </select>
      </div>

      <div class="form-group">
        <label for="soil-moisture">Влажность почвы (%):</label>
        <input type="number" id="soil-moisture" v-model.number="field.soilMoisture" class="standart-input" step="0.01" />
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'FieldForm',
  setup() {
    const router = useRouter();
    const field = ref({
      name: '',
      area: null,
      precipitation: null,
      humidity: null,
      temperature: null,
      ph: null,
      nutrients: 'medium',
      organic: null,
      soilType: 'loamy',
      soilMoisture: null,
    });

    const saveField = () => {
      // Здесь будет вызов API для сохранения
      console.log('Сохранить поле:', field.value);
      // После сохранения перейти к списку полей
      router.push('/crop-rotation/fields');
    };

    return { field, saveField };
  },
};
</script>