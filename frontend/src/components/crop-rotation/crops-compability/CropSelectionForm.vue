<template>
  <div class="form-overlay">
    <div class="standart-form">
      <router-link to="/crop-rotation/compatibility">
        <button class="close-button">
          <img src="/assets/close.svg" alt="Закрыть" class="close-icon" />
        </button>
      </router-link>

      <h2>Подбор культуры</h2>
      <form @submit.prevent="submitForm">
        <div class="standart-form-group">
          <label for="field">Поле:</label>
          <input type="text" id="field" v-model="form.field" class="standart-input" required />
        </div>
        <div class="standart-form-group">
          <label for="budget">Бюджет:</label>
          <input type="number" id="budget" v-model.number="form.budget" class="standart-input" step="0.01" />
        </div>
        <div class="standart-form-group">
          <button type="submit" class="form-button">Добавить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'CropSelectionForm',
  setup() {
    const router = useRouter();
    const form = ref({ field: '', budget: null });

    const submitForm = () => {
      // Здесь будет отправка данных
      console.log('Подбор культуры', form.value);
      router.push('/crop-rotation/crop-selection');
    };

    return { form, submitForm };
  },
};
</script>