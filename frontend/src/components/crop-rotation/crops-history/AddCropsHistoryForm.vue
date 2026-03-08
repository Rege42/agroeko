<template>
  <div class="form-overlay">
    <div class="standart-form">
      <router-link :to="`/crop-rotation/history/${fieldId}`">
        <button class="close-button">
          <img src="/assets/close.svg" alt="Закрыть" class="close-icon" />
        </button>
      </router-link>

      <h2>Добавление севооборота</h2>
      <form @submit.prevent="submitForm">
        <div class="standart-form-group">
          <label for="year">Год:</label>
          <input type="number" id="year" v-model.number="form.year" class="standart-input" required />
        </div>
        <div class="standart-form-group">
          <label for="crop">Культура:</label>
          <input type="text" id="crop" v-model="form.crop" class="standart-input" required />
        </div>
        <div class="standart-form-group">
          <label for="predicted-yield">Прогнозируемая урожайность:</label>
          <input type="number" id="predicted-yield" v-model.number="form.predictedYield" class="standart-input" step="0.01" />
        </div>
        <div class="standart-form-group">
          <label for="actual-yield">Урожайность:</label>
          <input type="number" id="actual-yield" v-model.number="form.actualYield" class="standart-input" step="0.01" />
        </div>
        <div class="standart-form-group">
          <label for="notes">Замечания:</label>
          <textarea id="notes" v-model="form.notes" class="standart-input" rows="5"></textarea>
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
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'AddCropsHistoryForm',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const fieldId = route.params.fieldId;

    const form = ref({
      year: new Date().getFullYear(),
      crop: '',
      predictedYield: null,
      actualYield: null,
      notes: '',
    });

    const submitForm = () => {
      console.log('Добавить запись для поля', fieldId, form.value);
      // После сохранения вернуться к истории поля
      router.push(`/crop-rotation/history/${fieldId}`);
    };

    return { fieldId, form, submitForm };
  },
};
</script>