<template>
  <main class="main-content">
    <div class="field-header">
      <div class="field-title-block">
        <h2 class="field-name">
          {{
            field?.name ? `История посевов: ${field.name}` : "История посевов"
          }}
        </h2>

        <div v-if="field" class="field-meta">
          <span v-if="field.area"
            >Площадь: {{ formatNumber(field.area) }} га</span
          >
          <span v-if="field.soilType"
            >Тип почвы: {{ getSoilTypeLabel(field.soilType) }}</span
          >
          <span v-if="field.location"
            >Местоположение: {{ field.location }}</span
          >
        </div>
      </div>

      <div class="header-actions">
        <router-link to="/crop-rotation/history">
          <button class="standart-button">Назад</button>
        </router-link>

        <router-link :to="{ name: 'CropRotationAdd', params: { fieldId } }">
          <button class="standart-button">Добавить историю</button>
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="info-block">Загрузка истории посевов...</div>

    <div v-else-if="errorMessage" class="error-block">
      {{ errorMessage }}
    </div>

    <template v-else>
      <div v-if="historyEntries.length" class="table-wrapper">
        <table class="standart-table">
          <thead>
            <tr>
              <th>Год</th>
              <th>Культура</th>
              <th>Статус сезона</th>
              <th>Дата посева</th>
              <th>Дата уборки</th>
              <th>Прогнозируемая урожайность</th>
              <th>Фактическая урожайность</th>
              <th>Примечания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in historyEntries" :key="getEntryId(entry)">
              <td>{{ entry.seasonYear ?? "—" }}</td>
              <td>{{ getCropName(entry.crop) }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="`status-${entry.seasonStatus || 'planned'}`"
                >
                  {{ getSeasonStatusLabel(entry.seasonStatus) }}
                </span>
              </td>
              <td>{{ formatDate(entry.sowingDate) }}</td>
              <td>{{ formatDate(entry.harvestDate) }}</td>
              <td>{{ formatYield(entry.predictedYield, entry.yieldUnit) }}</td>
              <td>{{ formatYield(entry.finalYield, entry.yieldUnit) }}</td>
              <td>{{ entry.notes || "—" }}</td>
              <td class="actions-cell">
                <router-link
                  :to="{
                    name: 'CropRotationEdit',
                    params: {
                      fieldId,
                      entryId: getEntryId(entry),
                    },
                  }"
                >
                  <button class="table-action-btn standart-button">Изменить</button>
                </router-link>

                <button
                  class="table-action-btn danger-btn standart-button"
                  type="button"
                  :disabled="deletingId === getEntryId(entry)"
                  @click="removeEntry(entry)"
                >
                  {{
                    deletingId === getEntryId(entry) ? "Удаление..." : "Удалить"
                  }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="info-block">
        Для данного поля история посевов пока отсутствует.
      </div>
    </template>
  </main>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { fieldApi, cropsRotationApi } from "@/services/api";

export default {
  name: "FieldHistory",
  setup() {
    const route = useRoute();

    const fieldId = route.params.fieldId;

    const field = ref(null);
    const historyEntries = ref([]);
    const loading = ref(true);
    const errorMessage = ref("");
    const deletingId = ref(null);

    const soilTypeLabels = {
      chernozem: "Чернозем",
      sandy: "Песчаная",
      clay: "Глинистая",
      loam: "Суглинистая",
      peat: "Торфяная",
      saline: "Засоленная",
      other: "Другая",
    };

    const seasonStatusLabels = {
      planned: "Запланирован",
      active: "В процессе",
      harvested: "Убран",
      closed: "Закрыт",
    };

    const normalizeListResponse = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.items)) return payload.items;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.results)) return payload.results;
      return [];
    };

    const normalizeEntityResponse = (payload) => {
      if (!payload) return null;
      if (payload.data && !Array.isArray(payload.data)) return payload.data;
      if (payload.item) return payload.item;
      return payload;
    };

    const getEntryId = (entry) => entry?._id ?? entry?.id;

    const getCropName = (crop) => {
      if (!crop) return "—";
      if (typeof crop === "string") return crop;
      return crop.name || "—";
    };

    const getSoilTypeLabel = (value) => soilTypeLabels[value] || value || "—";

    const getSeasonStatusLabel = (value) =>
      seasonStatusLabels[value] || value || "—";

    const formatDate = (value) => {
      if (!value) return "—";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "—";

      return date.toLocaleDateString("ru-RU");
    };

    const formatNumber = (value) => {
      if (value === null || value === undefined || value === "") return "—";

      return new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 2,
      }).format(value);
    };

    const formatYield = (value, unit) => {
      if (value === null || value === undefined) return "—";
      return `${formatNumber(value)} ${unit || "t/ha"}`;
    };

    const loadField = async () => {
      const payload = await fieldApi.getById(fieldId);
      field.value = normalizeEntityResponse(payload);
    };

    const loadHistory = async () => {
      const payload = await cropsRotationApi.getAll({
        field: fieldId,
        sortBy: "seasonYear",
        sortOrder: "desc",
        limit: 100,
      });

      const items = normalizeListResponse(payload);

      historyEntries.value = [...items].sort(
        (a, b) => (b.seasonYear || 0) - (a.seasonYear || 0),
      );
    };

    const loadPageData = async () => {
      loading.value = true;
      errorMessage.value = "";

      try {
        await Promise.all([loadField(), loadHistory()]);
      } catch (error) {
        errorMessage.value =
          error.response?.data?.message ||
          "Не удалось загрузить историю посевов.";
      } finally {
        loading.value = false;
      }
    };

    const removeEntry = async (entry) => {
      const entryId = getEntryId(entry);
      if (!entryId) return;

      const confirmed = window.confirm(
        `Удалить запись севооборота за ${entry.seasonYear} год?`,
      );

      if (!confirmed) return;

      deletingId.value = entryId;

      try {
        await cropsRotationApi.delete(entryId);
        historyEntries.value = historyEntries.value.filter(
          (item) => getEntryId(item) !== entryId,
        );
      } catch (error) {
        window.alert(
          error.response?.data?.message ||
            "Не удалось удалить запись истории посевов.",
        );
      } finally {
        deletingId.value = null;
      }
    };

    onMounted(loadPageData);

    return {
      fieldId,
      field,
      historyEntries,
      loading,
      errorMessage,
      deletingId,
      getEntryId,
      getCropName,
      getSoilTypeLabel,
      getSeasonStatusLabel,
      formatDate,
      formatNumber,
      formatYield,
      removeEntry,
    };
  },
};
</script>

<style scoped>
.field-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.field-title-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-name {
  margin: 0;
}

.field-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #5b5b5b;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.secondary-button {
  background: #f1f1f1;
  color: #333;
}

.table-wrapper {
  overflow-x: auto;
}

.actions-cell {
  white-space: nowrap;
  display: flex;
  gap: 8px;
}

.table-action-btn {
  padding: 6px 10px;
  background: #fff;
  cursor: pointer;
  border-radius: 6px;
}

.table-action-btn:hover {
  background: #f5f5f5;
}

.danger-btn {
  color: #b42318;
  border-color: #b42318;
}

.danger-btn:hover {
  background: #fff1f1;
}

.info-block,
.error-block {
  padding: 16px;
  border-radius: 8px;
}

.info-block {
  background: #f5f5f5;
}

.error-block {
  background: #fff1f1;
  color: #b42318;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-planned {
  background: #eef2ff;
  color: #3730a3;
}

.status-active {
  background: #ecfeff;
  color: #155e75;
}

.status-harvested {
  background: #ecfdf3;
  color: #027a48;
}

.status-closed {
  background: #f4f4f5;
  color: #3f3f46;
}
</style>
