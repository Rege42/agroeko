<template>
  <div>
    <div class="search-bar">
      <label for="crop-search">Поиск:</label>
      <input
        id="crop-search"
        v-model="searchInput"
        class="standart-input medium-width"
        type="text"
        placeholder="Введите название культуры..."
        @keyup.enter="applySearch"
      />
      <button class="standart-button" @click="applySearch">Найти</button>

      <router-link
        to="/crop-rotation/crop-selection/new"
        class="right-position"
      >
        <button class="standart-button right-position">
          Подобрать культуру
        </button>
      </router-link>
    </div>

    <div style="padding: 60px">
      <div v-if="loading" class="margin-top-30px">Загрузка матрицы...</div>

      <div v-else-if="error" class="margin-top-30px error-text">
        {{ error }}
      </div>

      <table v-else class="standart-table full-width margin-top-30px">
        <thead>
          <tr>
            <th rowspan="2" class="border-bottom first-column-header">
              Культуры, допустимый срок возврата на прежнее поле по
              фитосанитарным условиям, лет
            </th>

            <th
              v-if="mainColumns.length > 0"
              :colspan="mainColumns.length"
              class="border-bottom"
              style="color: #333"
            >
              Предшественник
            </th>

            <th
              v-if="intermediateColumns.length > 0"
              :colspan="intermediateColumns.length"
              class="border-bottom"
            >
              промежуточные
            </th>
          </tr>

          <tr>
            <th
              v-for="column in displayedColumns"
              :key="column.groupId"
              class="vertical border-bottom"
            >
              {{ column.groupName }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in displayedRows" :key="row.groupId">
            <td class="row-title-cell">
              {{ formatRowTitle(row) }}
            </td>

            <td
              v-for="column in displayedColumns"
              :key="`${row.groupId}-${column.groupId}`"
              :class="getCellClass(row.groupId, column.groupId)"
              :title="getCellTitle(row.groupId, column.groupId)"
            ></td>
          </tr>
        </tbody>
      </table>

      <div class="legend">
        <div v-for="item in legend" :key="item.level" class="legend-item">
          <div class="legend-color" :class="item.className"></div>
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { getCropCompatibilityMatrix } from "@/services/api";

export default {
  name: "CropsCompatibility",
  setup() {
    const loading = ref(false);
    const error = ref("");
    const searchInput = ref("");
    const appliedSearch = ref("");

    const rows = ref([]);
    const columns = ref([]);
    const cells = ref([]);

    const legend = ref([
      { level: "EXCELLENT", className: "color-brown", label: "Отличный" },
      { level: "GOOD", className: "color-green", label: "Хороший" },
      { level: "ACCEPTABLE", className: "color-yellow", label: "Допустимый" },
      {
        level: "RISKY",
        className: "color-blue",
        label: "Хороший, но не всегда возможный",
      },
      {
        level: "FORBIDDEN",
        className: "color-red",
        label: "Размещение недопустимо",
      },
    ]);

    const normalize = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();

    const isIntermediateCategory = (column) => {
      if (column.category === "intermediate") {
        return true;
      }

      const name = normalize(column.groupName);

      return ["поукосные", "пожнивные", "сидераты"].includes(name);
    };

    const filteredRows = computed(() => {
      const query = normalize(appliedSearch.value);

      if (!query) {
        return rows.value;
      }

      return rows.value.filter((row) =>
        normalize(row.groupName).includes(query),
      );
    });

    const filteredColumns = computed(() => columns.value);

    const mainColumns = computed(() =>
      filteredColumns.value.filter((column) => !isIntermediateCategory(column)),
    );

    const intermediateColumns = computed(() =>
      filteredColumns.value.filter((column) => isIntermediateCategory(column)),
    );

    const displayedColumns = computed(() => [
      ...mainColumns.value,
      ...intermediateColumns.value,
    ]);

    const displayedRows = computed(() => filteredRows.value);

    const cellsMap = computed(() => {
      const map = new Map();

      for (const cell of cells.value) {
        map.set(`${cell.targetGroupId}_${cell.predecessorGroupId}`, cell);
      }

      return map;
    });

    const levelToClassMap = {
      EXCELLENT: "color-brown",
      GOOD: "color-green",
      ACCEPTABLE: "color-yellow",
      RISKY: "color-blue",
      FORBIDDEN: "color-red",
    };

    const getCell = (rowId, columnId) =>
      cellsMap.value.get(`${rowId}_${columnId}`) || null;

    const getCellClass = (rowId, columnId) => {
      const cell = getCell(rowId, columnId);

      if (!cell) {
        return "color-empty";
      }

      return levelToClassMap[cell.compatibilityLevel] || "color-empty";
    };

    const getCellTitle = (rowId, columnId) => {
      const cell = getCell(rowId, columnId);

      if (!cell) {
        return "Нет данных";
      }

      const levelLabel =
        legend.value.find((item) => item.level === cell.compatibilityLevel)
          ?.label || cell.compatibilityLevel;

      const parts = [levelLabel];

      if (
        cell.returnPeriodMinYears !== null &&
        cell.returnPeriodMinYears !== undefined
      ) {
        if (
          cell.returnPeriodMaxYears !== null &&
          cell.returnPeriodMaxYears !== undefined &&
          cell.returnPeriodMaxYears !== cell.returnPeriodMinYears
        ) {
          parts.push(
            `Срок возврата: ${cell.returnPeriodMinYears}–${cell.returnPeriodMaxYears} лет`,
          );
        } else {
          parts.push(`Срок возврата: ${cell.returnPeriodMinYears} лет`);
        }
      }

      if (cell.note) {
        parts.push(cell.note);
      }

      return parts.join(". ");
    };

    const formatRowTitle = (row) => {
      if (
        row.returnPeriodMinYears !== null &&
        row.returnPeriodMinYears !== undefined
      ) {
        if (
          row.returnPeriodMaxYears !== null &&
          row.returnPeriodMaxYears !== undefined &&
          row.returnPeriodMaxYears !== row.returnPeriodMinYears
        ) {
          return `${row.groupName} ${row.returnPeriodMinYears}–${row.returnPeriodMaxYears}`;
        }

        return `${row.groupName} ${row.returnPeriodMinYears}`;
      }

      return row.groupName;
    };

    const fetchMatrix = async () => {
      loading.value = true;
      error.value = "";

      try {
        const response = await getCropCompatibilityMatrix();

        const data = response?.data || response;

        rows.value = Array.isArray(data.rows) ? data.rows : [];
        columns.value = Array.isArray(data.columns) ? data.columns : [];
        cells.value = Array.isArray(data.cells) ? data.cells : [];
      } catch (err) {
        console.log(err);
        error.value =
          err?.response?.data?.message ||
          "Не удалось загрузить матрицу совместимости культур";
      } finally {
        loading.value = false;
      }
    };

    const applySearch = () => {
      appliedSearch.value = searchInput.value;
    };

    onMounted(() => {
      fetchMatrix();
    });

    return {
      loading,
      error,
      searchInput,
      legend,
      mainColumns,
      intermediateColumns,
      displayedColumns,
      displayedRows,
      applySearch,
      getCellClass,
      getCellTitle,
      formatRowTitle,
    };
  },
};
</script>

<style scoped>
.compatibility-table {
  border-collapse: collapse;
  table-layout: fixed;
}

.first-column-header {
  min-width: 260px;
  max-width: 260px;
  color: #333;
  text-align: center;
  vertical-align: middle;
}

.row-title-cell {
  color: #333;
  text-align: center;
  vertical-align: middle;
  white-space: normal;
  min-width: 260px;
}

.vertical {
  color: #333;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
  min-width: 56px;
}

.color-brown,
.color-green,
.color-yellow,
.color-blue,
.color-red,
.color-empty {
  min-width: 34px;
  height: 28px;
}

.color-brown {
  background-color: #a52a2a;
}

.color-green {
  background-color: #008000;
}

.color-yellow {
  background-color: #ffff00;
}

.color-blue {
  background-color: #0000ff;
}

.color-red {
  background-color: #ff0000;
}

.color-empty {
  background-color: #ffffff;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.legend-item {
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border: 1px solid #000;
}

.error-text {
  color: #c62828;
}
</style>
