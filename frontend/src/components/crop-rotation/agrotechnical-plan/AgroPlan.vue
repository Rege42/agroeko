<template>
  <div>
    <div class="search-bar">
      <label for="field-search">Поиск:</label>
      <input
        class="standart-input medium-width"
        type="text"
        id="field-search"
        placeholder="Введите название поля..."
        v-model="searchQuery"
      />
      <button class="standart-button" @click="search">Найти</button>
      <h1 class="right-position">{{ selectedFieldName || 'Поле 1' }}</h1>
    </div>

    <div style="padding: 20px">
      <table class="standart-table full-width margin-top-30px">
        <thead>
          <tr>
            <th>Этап</th>
            <th>Дата</th>
            <th>Описание работ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="step in planSteps" :key="step.name">
            <td>{{ step.name }}</td>
            <td>{{ step.date }}</td>
            <td>{{ step.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'AgroPlan',
  setup() {
    const searchQuery = ref('');
    const selectedFieldName = ref('Поле 1'); // заглушка

    const planSteps = ref([
      { name: 'Подготовка почвы', date: '10-20 марта', description: 'Вспашка, дискование, внесение удобрений' },
      { name: 'Посев', date: '25-30 марта', description: 'Посев выбранной культуры, контроль глубины' },
      { name: 'Уход за растениями', date: 'Апрель-июнь', description: 'Полив, внесение гербицидов и удобрений' },
      { name: 'Мониторинг', date: 'Весь сезон', description: 'Оценка состояния посевов, борьба с вредителями' },
      { name: 'Сбор урожая', date: 'Сентябрь', description: 'Уборка, анализ урожайности, подготовка отчётов' },
    ]);

    const search = () => {
      // Поиск поля
    };

    return { searchQuery, selectedFieldName, planSteps, search };
  },
};
</script>