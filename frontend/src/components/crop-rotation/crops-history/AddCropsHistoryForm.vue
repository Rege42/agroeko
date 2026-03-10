<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-card">
      <button class="close-button" type="button" @click="closeModal" aria-label="Закрыть">
        ×
      </button>

      <h2 class="modal-title">
        {{ isEditMode ? "Редактирование записи севооборота" : "Добавление севооборота" }}
      </h2>

      <form class="standart-form" @submit.prevent="submitForm">
        <div v-if="errorMessage" class="error-block">
          {{ errorMessage }}
        </div>

        <div class="standart-form-group">
          <label for="seasonYear">Год сезона:</label>
          <input
            id="seasonYear"
            v-model.number="form.seasonYear"
            type="number"
            min="2000"
            max="2100"
            class="standart-input"
            required
          />
        </div>

        <div class="standart-form-group">
          <label for="crop">Культура:</label>
          <select
            id="crop"
            v-model="form.crop"
            class="standart-input"
            required
          >
            <option value="" disabled>Выберите культуру</option>
            <option
              v-for="crop in crops"
              :key="crop._id || crop.id"
              :value="crop._id || crop.id"
            >
              {{ crop.name }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="standart-form-group">
            <label for="sowingDate">Дата посева:</label>
            <input
              id="sowingDate"
              v-model="form.sowingDate"
              type="date"
              class="standart-input"
            />
          </div>

          <div class="standart-form-group">
            <label for="harvestDate">Дата уборки:</label>
            <input
              id="harvestDate"
              v-model="form.harvestDate"
              type="date"
              class="standart-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="standart-form-group">
            <label for="predictedYield">Прогнозируемая урожайность:</label>
            <input
              id="predictedYield"
              v-model.number="form.predictedYield"
              type="number"
              min="0"
              step="0.01"
              class="standart-input"
            />
          </div>

          <div class="standart-form-group">
            <label for="finalYield">Фактическая урожайность:</label>
            <input
              id="finalYield"
              v-model.number="form.finalYield"
              type="number"
              min="0"
              step="0.01"
              class="standart-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="standart-form-group">
            <label for="yieldUnit">Единица измерения:</label>
            <input
              id="yieldUnit"
              v-model.trim="form.yieldUnit"
              type="text"
              maxlength="20"
              class="standart-input"
              placeholder="Например, t/ha"
            />
          </div>

          <div class="standart-form-group">
            <label for="seasonStatus">Статус сезона:</label>
            <select
              id="seasonStatus"
              v-model="form.seasonStatus"
              class="standart-input"
            >
              <option value="planned">Запланирован</option>
              <option value="active">В процессе</option>
              <option value="harvested">Убран</option>
              <option value="closed">Закрыт</option>
            </select>
          </div>
        </div>

        <div class="standart-form-group">
          <label for="notes">Примечания:</label>
          <textarea
            id="notes"
            v-model.trim="form.notes"
            class="standart-input"
            rows="5"
            maxlength="3000"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="standart-button" @click="closeModal">
            Отмена
          </button>
          <button type="submit" class="standart-button" :disabled="submitting">
            {{ submitting ? "Сохранение..." : isEditMode ? "Сохранить" : "Добавить" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { cropApi, CropsRotationApi  } from "@/services/api";

export default {
  name: "AddCropsHistoryForm",
  emits: ["saved"],
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();

    const fieldId = computed(() => route.params.fieldId);
    const entryId = computed(() => route.params.entryId);
    const isEditMode = computed(() => Boolean(entryId.value));

    const crops = ref([]);
    const submitting = ref(false);
    const loading = ref(false);
    const errorMessage = ref("");

    const form = ref({
      field: fieldId.value,
      crop: "",
      seasonYear: new Date().getFullYear(),
      sowingDate: "",
      harvestDate: "",
      predictedYield: null,
      finalYield: null,
      yieldUnit: "t/ha",
      seasonStatus: "planned",
      notes: "",
    });

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

    const mapEntryToForm = (entry) => {
      form.value = {
        field: entry.field?._id || entry.field || fieldId.value,
        crop: entry.crop?._id || entry.crop || "",
        seasonYear: entry.seasonYear ?? new Date().getFullYear(),
        sowingDate: formatDateForInput(entry.sowingDate),
        harvestDate: formatDateForInput(entry.harvestDate),
        predictedYield: entry.predictedYield ?? null,
        finalYield: entry.finalYield ?? null,
        yieldUnit: entry.yieldUnit || "t/ha",
        seasonStatus: entry.seasonStatus || "planned",
        notes: entry.notes || "",
      };
    };

    const formatDateForInput = (value) => {
      if (!value) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    };

    const buildPayload = () => ({
      field: fieldId.value,
      crop: form.value.crop,
      seasonYear: form.value.seasonYear,
      sowingDate: form.value.sowingDate || null,
      harvestDate: form.value.harvestDate || null,
      predictedYield:
        form.value.predictedYield === "" || form.value.predictedYield === null
          ? 0
          : Number(form.value.predictedYield),
      finalYield:
        form.value.finalYield === "" || form.value.finalYield === null
          ? 0
          : Number(form.value.finalYield),
      yieldUnit: form.value.yieldUnit?.trim() || "t/ha",
      seasonStatus: form.value.seasonStatus || "planned",
      notes: form.value.notes?.trim() || "",
    });

    const closeModal = () => {
      router.push({
        name: "FieldHistory",
        params: { fieldId: fieldId.value },
      });
    };

    const onEscClose = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    const loadCrops = async () => {
      const payload = await cropApi.getAll({ limit: 100 });
      crops.value = normalizeListResponse(payload);
    };

    const loadEntry = async () => {
      if (!isEditMode.value) return;
      const payload = await CropsRotationApi.getById(entryId.value);
      const entry = normalizeEntityResponse(payload);
      mapEntryToForm(entry);
    };

    const validateForm = () => {
      if (!form.value.crop) {
        errorMessage.value = "Необходимо выбрать культуру.";
        return false;
      }

      if (!form.value.seasonYear) {
        errorMessage.value = "Необходимо указать год сезона.";
        return false;
      }

      if (
        form.value.sowingDate &&
        form.value.harvestDate &&
        form.value.harvestDate < form.value.sowingDate
      ) {
        errorMessage.value = "Дата уборки не может быть раньше даты посева.";
        return false;
      }

      return true;
    };

    const submitForm = async () => {
      errorMessage.value = "";

      if (!validateForm()) return;

      submitting.value = true;

      try {
        const payload = buildPayload();

        if (isEditMode.value) {
          await CropsRotationApi.update(entryId.value, payload);
        } else {
          await CropsRotationApi.create(payload);
        }

        emit("saved");
        closeModal();
      } catch (error) {
        errorMessage.value =
          error.response?.data?.message || "Не удалось сохранить запись.";
      } finally {
        submitting.value = false;
      }
    };

    const init = async () => {
      loading.value = true;
      errorMessage.value = "";

      try {
        await Promise.all([loadCrops(), loadEntry()]);
      } catch (error) {
        errorMessage.value =
          error.response?.data?.message || "Не удалось загрузить форму.";
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("keydown", onEscClose);
      init();
    });

    onBeforeUnmount(() => {
      document.removeEventListener("keydown", onEscClose);
    });

    return {
      fieldId,
      entryId,
      isEditMode,
      form,
      crops,
      loading,
      submitting,
      errorMessage,
      submitForm,
      closeModal,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(20, 20, 20, 0.35);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-card {
  position: relative;
  width: min(760px, calc(100vw - 48px));
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff;
  border-radius: 16px;
  padding: 28px 24px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
}

.modal-title {
  margin: 0 0 20px 0;
  padding-right: 30px;
  color: #333;
}

.close-button {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  color: #333;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.close-button:hover {
  background: #e5e7eb;
}

.standart-form {
  width: 100%;
  box-sizing: border-box;
}

.standart-form-group {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

.standart-input,
textarea,
select,
input {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

textarea.standart-input {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.secondary-button {
  background: #f1f1f1;
  color: #333;
}

.error-block {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fff1f1;
  color: #b42318;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }

  .modal-card {
    width: 100%;
    max-height: 92vh;
    padding: 22px 16px 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>