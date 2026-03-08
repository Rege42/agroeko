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
      <router-link to="/crop-rotation/crop-selection/new" class="right-position">
        <button class="standart-button right-position">Подобрать культуру</button>
      </router-link>
    </div>

    <div style="padding: 20px">
      <table class="standart-table full-width margin-top-30px">
        <!-- Вставьте сложную таблицу из HTML -->
        <!-- Для краткости я приведу упрощённую версию, но коллега потом доделает -->
        <tr>
          <th rowspan="2" class="border-bottom">Культуры, допустимый срок возврата...</th>
          <th colspan="20" class="border-bottom">Предшественник</th>
          <th colspan="3" class="border-bottom">промежуточные</th>
        </tr>
        <tr>
          <th v-for="(crop, idx) in predecessors" :key="idx" class="vertical border-bottom">
            {{ crop }}
          </th>
        </tr>
        <tr v-for="(row, rowIdx) in compatibilityData" :key="rowIdx">
          <td>{{ row.culture }}</td>
          <td v-for="(cell, cellIdx) in row.cells" :key="cellIdx" :class="cell.class"></td>
        </tr>
      </table>

      <div class="legend">
        <div v-for="item in legend" :key="item.color" class="legend-item">
          <div class="legend-color" :class="item.color"></div>
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'CropsCompatibility',
  setup() {
    const searchQuery = ref('');
    const predecessors = ref([
      'оз. рожь', 'оз. пшеница', 'ячмень', 'яровая пшеница', 'рис', 'овес', 'просо',
      'гречка', 'кукуруза на зерно', 'горох', 'вика', 'картофель', 'лен', 'свекла корм.',
      'свекла', 'кукуруза', 'долючные травы', '(однолетние)', 'многолетние злак. травы',
      'люцерна', 'поукосные', 'поживные'
    ]);

    // Заглушка для данных (позже заменится)
    const compatibilityData = ref([
      { culture: 'Озимая рожь 1–2', cells: ['color-yellow', 'color-green'] },
      // ...
    ]);

    const legend = ref([
      { color: 'color-brown', label: 'Отличный' },
      { color: 'color-green', label: 'Хороший' },
      { color: 'color-yellow', label: 'Допустимый' },
      { color: 'color-blue', label: 'Хороший но не всегда возможный' },
      { color: 'color-red', label: 'Размещение не допустимо' },
    ]);

    const search = () => {};

    return { searchQuery, predecessors, compatibilityData, legend, search };
  },
};
</script>