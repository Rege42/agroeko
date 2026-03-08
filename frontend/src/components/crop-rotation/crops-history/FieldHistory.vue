<template>
  <div>
    <div class="field-header">
      <h2 class="field-name">Поле {{ fieldId }}</h2>
      <router-link :to="`/crop-rotation/history/${fieldId}/add`">
        <button class="standart-button">Добавить историю</button>
      </router-link>
    </div>
    <div class="table-wrapper">
      <table class="standart-table">
        <thead>
          <tr>
            <th>Год</th>
            <th>Культура</th>
            <th>Прогнозируемая урожайность</th>
            <th>Урожайность (ц/га)</th>
            <th>Замечания</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in historyEntries" :key="entry.year">
            <td>{{ entry.year }}</td>
            <td>{{ entry.crop }}</td>
            <td>{{ entry.predictedYield }}</td>
            <td>{{ entry.actualYield }}</td>
            <td>{{ entry.notes }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'FieldHistory',
  setup() {
    const route = useRoute();
    const fieldId = route.params.fieldId;
    const historyEntries = ref([]);

    onMounted(() => {
      // Заглушка данных (позже заменится на API)
      historyEntries.value = [
        { year: 2023, crop: 'Пшеница', predictedYield: 40, actualYield: 45, notes: 'Хорошая всхожесть' },
        { year: 2022, crop: 'Подсолнечник', predictedYield: 56, actualYield: 48, notes: 'Засушливый сезон' },
        { year: 2021, crop: 'Кукуруза', predictedYield: 38, actualYield: 50, notes: 'Высокая урожайность' },
        { year: 2020, crop: 'Ячмень', predictedYield: 50, actualYield: 52, notes: 'Средние показатели' },
        { year: 2019, crop: 'Пшеница', predictedYield: 45, actualYield: 44, notes: 'Оптимальные условия' },
      ];
    });

    return { fieldId, historyEntries };
  },
};
</script>