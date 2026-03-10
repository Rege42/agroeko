<template>
  <div class="form-overlay">
    <div class="standart-form large-form">
      <button class="close-button" @click="$emit('close')">
        <img src="/assets/close.svg" alt="Закрыть" class="close-icon" />
      </button>

      <h2>
        {{
          mode === "create" ? "Создание агроплана" : "Редактирование агроплана"
        }}
      </h2>

      <form @submit.prevent="submitForm">
        <div class="standart-form-group">
          <label for="field-search">Поле:</label>

          <div class="select-wrapper" ref="fieldSelectWrapperRef">
            <input
              id="field-search"
              v-model="fieldSearch"
              type="text"
              class="standart-input"
              placeholder="Введите название поля..."
              autocomplete="off"
              @focus="openFieldDropdown"
              @input="handleFieldSearchInput"
            />

            <div v-if="fieldDropdownOpen" class="dropdown">
              <div v-if="loadingFields" class="dropdown-state">Загрузка...</div>

              <div v-else-if="fieldsError" class="dropdown-state error-text">
                {{ fieldsError }}
              </div>

              <template v-else>
                <div v-if="fieldOptions.length === 0" class="dropdown-state">
                  Поля не найдены
                </div>

                <button
                  v-for="field in fieldOptions"
                  :key="field._id"
                  type="button"
                  class="dropdown-item"
                  @click="selectField(field)"
                >
                  {{ field.name }}
                </button>

                <div class="dropdown-footer">
                  <button
                    type="button"
                    class="small-button"
                    :disabled="fieldCurrentPage <= 1 || loadingFields"
                    @click="goToPreviousFieldPage"
                  >
                    Назад
                  </button>

                  <span class="page-indicator">
                    Страница {{ fieldCurrentPage }} из {{ fieldTotalPages }}
                  </span>

                  <button
                    type="button"
                    class="small-button"
                    :disabled="
                      fieldCurrentPage >= fieldTotalPages || loadingFields
                    "
                    @click="goToNextFieldPage"
                  >
                    Далее
                  </button>
                </div>
              </template>
            </div>
          </div>

          <div v-if="selectedField" class="selected-field-hint">
            Выбрано: {{ selectedField.name }}
          </div>
        </div>

        <div class="standart-form-group">
          <label for="entry-search">Запись севооборота:</label>

          <div class="select-wrapper" ref="entrySelectWrapperRef">
            <input
              id="entry-search"
              v-model="entrySearch"
              type="text"
              class="standart-input"
              placeholder="Введите название культуры..."
              autocomplete="off"
              :disabled="!selectedField"
              @focus="openEntryDropdown"
              @input="handleEntrySearchInput"
            />

            <div v-if="entryDropdownOpen" class="dropdown">
              <div v-if="loadingEntries" class="dropdown-state">
                Загрузка...
              </div>

              <div v-else-if="entriesError" class="dropdown-state error-text">
                {{ entriesError }}
              </div>

              <template v-else>
                <div v-if="entryOptions.length === 0" class="dropdown-state">
                  Записи севооборота не найдены
                </div>

                <button
                  v-for="entry in entryOptions"
                  :key="entry._id"
                  type="button"
                  class="dropdown-item"
                  @click="selectEntry(entry)"
                >
                  {{ formatEntryLabel(entry) }}
                </button>

                <div class="dropdown-footer">
                  <button
                    type="button"
                    class="small-button"
                    :disabled="entryCurrentPage <= 1 || loadingEntries"
                    @click="goToPreviousEntryPage"
                  >
                    Назад
                  </button>

                  <span class="page-indicator">
                    Страница {{ entryCurrentPage }} из {{ entryTotalPages }}
                  </span>

                  <button
                    type="button"
                    class="small-button"
                    :disabled="
                      entryCurrentPage >= entryTotalPages || loadingEntries
                    "
                    @click="goToNextEntryPage"
                  >
                    Далее
                  </button>
                </div>
              </template>
            </div>
          </div>

          <div v-if="selectedEntry" class="selected-field-hint">
            Выбрано: {{ formatEntryLabel(selectedEntry) }}
          </div>
        </div>

        <div class="standart-form-group">
          <label for="plannedStartDate">Плановая дата начала:</label>
          <input
            id="plannedStartDate"
            v-model="form.plannedStartDate"
            class="standart-input"
            type="date"
          />
        </div>

        <div class="standart-form-group">
          <label for="plannedEndDate">Плановая дата окончания:</label>
          <input
            id="plannedEndDate"
            v-model="form.plannedEndDate"
            class="standart-input"
            type="date"
          />
        </div>

        <div class="standart-form-group">
          <label for="status">Статус:</label>
          <select id="status" v-model="form.status" class="standart-input">
            <option value="draft">Черновик</option>
            <option value="approved">Утверждён</option>
            <option value="in_progress">Выполняется</option>
            <option value="completed">Завершён</option>
            <option value="cancelled">Отменён</option>
          </select>
        </div>

        <div class="standart-form-group">
          <label for="notes">Примечание:</label>
          <textarea
            id="notes"
            v-model="form.notes"
            class="standart-input"
            rows="4"
          />
        </div>
        <div class="standart-form-group">
          <button class="form-button" type="submit" :disabled="submitting">
            {{ submitting ? "Сохранение..." : "Сохранить" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { agroPlanApi, fieldApi, cropsRotationApi } from "@/services/api";

export default {
  name: "AgroPlanForm",
  props: {
    mode: {
      type: String,
      default: "create",
    },
    plan: {
      type: Object,
      default: null,
    },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const submitting = ref(false);

    const form = reactive({
      field: "",
      cropRotationEntry: "",
      plannedStartDate: "",
      plannedEndDate: "",
      status: "draft",
      notes: "",
    });

    const selectedField = ref(null);
    const selectedEntry = ref(null);

    const fieldSearch = ref("");
    const fieldDropdownOpen = ref(false);
    const fieldOptions = ref([]);
    const loadingFields = ref(false);
    const fieldsError = ref("");
    const fieldCurrentPage = ref(1);
    const fieldTotalPages = ref(1);
    const fieldLimit = 10;
    const fieldSelectWrapperRef = ref(null);

    const entrySearch = ref("");
    const entryDropdownOpen = ref(false);
    const entryOptions = ref([]);
    const loadingEntries = ref(false);
    const entriesError = ref("");
    const entryCurrentPage = ref(1);
    const entryTotalPages = ref(1);
    const entryLimit = 10;
    const entrySelectWrapperRef = ref(null);

    let fieldSearchTimeout = null;
    let entrySearchTimeout = null;

    const toInputDate = (value) => {
      if (!value) return "";
      return new Date(value).toISOString().slice(0, 10);
    };

    const formatEntryLabel = (entry) => {
      const cropName = entry?.crop?.name || "Без культуры";
      const year = entry?.seasonYear || "—";
      const fieldName = entry?.field?.name || "Без поля";
      return `${cropName} (${year}) — ${fieldName}`;
    };

    const fillForm = async () => {
      form.field = props.plan?.field?._id || props.plan?.field || "";
      form.cropRotationEntry =
        props.plan?.cropRotationEntry?._id ||
        props.plan?.cropRotationEntry ||
        "";
      form.plannedStartDate = toInputDate(props.plan?.plannedStartDate);
      form.plannedEndDate = toInputDate(props.plan?.plannedEndDate);
      form.status = props.plan?.status || "draft";
      form.notes = props.plan?.notes || "";

      selectedField.value = props.plan?.field || null;
      selectedEntry.value = props.plan?.cropRotationEntry || null;

      fieldSearch.value = props.plan?.field?.name || "";
      entrySearch.value = props.plan?.cropRotationEntry
        ? formatEntryLabel(props.plan.cropRotationEntry)
        : "";

      if (!selectedField.value) {
        await loadFields();
      }

      if (selectedField.value) {
        await loadEntries();
      }
    };

    const loadFields = async () => {
      try {
        loadingFields.value = true;
        fieldsError.value = "";

        const response = await fieldApi.getAll({
          page: fieldCurrentPage.value,
          limit: fieldLimit,
          search: fieldSearch.value.trim() || undefined,
        });

        fieldOptions.value = response.items || [];
        fieldTotalPages.value = response.pagination?.pages || 1;
      } catch (error) {
        console.error("Ошибка загрузки полей", error);
        fieldsError.value =
          error.response?.data?.message || "Не удалось загрузить список полей";
      } finally {
        loadingFields.value = false;
      }
    };

    const loadEntries = async () => {
      if (!selectedField.value && !form.field) {
        entryOptions.value = [];
        entryTotalPages.value = 1;
        return;
      }

      try {
        loadingEntries.value = true;
        entriesError.value = "";

        const response = await cropsRotationApi.getAll({
          page: entryCurrentPage.value,
          limit: entryLimit,
          field: selectedField.value?._id || form.field,
          search: entrySearch.value.trim() || undefined,
        });

        let items = response.items || [];

        if (selectedField.value?._id || form.field) {
          const fieldId = selectedField.value?._id || form.field;
          items = items.filter((item) => item.field?._id === fieldId);
        }

        if (entrySearch.value.trim()) {
          const query = entrySearch.value.trim().toLowerCase();
          items = items.filter((item) =>
            (item.crop?.name || "").toLowerCase().includes(query),
          );
        }

        entryOptions.value = items;
        entryTotalPages.value = response.pagination?.pages || 1;
      } catch (error) {
        console.error("Ошибка загрузки записей севооборота", error);
        entriesError.value =
          error.response?.data?.message ||
          "Не удалось загрузить записи севооборота";
      } finally {
        loadingEntries.value = false;
      }
    };

    const openFieldDropdown = async () => {
      fieldDropdownOpen.value = true;
      await loadFields();
    };

    const openEntryDropdown = async () => {
      if (!selectedField.value && !form.field) {
        return;
      }

      entryDropdownOpen.value = true;
      await loadEntries();
    };

    const handleFieldSearchInput = () => {
      fieldCurrentPage.value = 1;
      clearTimeout(fieldSearchTimeout);
      fieldSearchTimeout = setTimeout(() => {
        loadFields();
      }, 300);
    };

    const handleEntrySearchInput = () => {
      entryCurrentPage.value = 1;
      clearTimeout(entrySearchTimeout);
      entrySearchTimeout = setTimeout(() => {
        loadEntries();
      }, 300);
    };

    const selectField = async (field) => {
      selectedField.value = field;
      form.field = field._id;
      fieldSearch.value = field.name;
      fieldDropdownOpen.value = false;

      selectedEntry.value = null;
      form.cropRotationEntry = "";
      entrySearch.value = "";
      entryCurrentPage.value = 1;

      await loadEntries();
    };

    const selectEntry = (entry) => {
      selectedEntry.value = entry;
      form.cropRotationEntry = entry._id;
      entrySearch.value = formatEntryLabel(entry);
      entryDropdownOpen.value = false;
    };

    const goToPreviousFieldPage = async () => {
      if (fieldCurrentPage.value <= 1) return;
      fieldCurrentPage.value -= 1;
      await loadFields();
    };

    const goToNextFieldPage = async () => {
      if (fieldCurrentPage.value >= fieldTotalPages.value) return;
      fieldCurrentPage.value += 1;
      await loadFields();
    };

    const goToPreviousEntryPage = async () => {
      if (entryCurrentPage.value <= 1) return;
      entryCurrentPage.value -= 1;
      await loadEntries();
    };

    const goToNextEntryPage = async () => {
      if (entryCurrentPage.value >= entryTotalPages.value) return;
      entryCurrentPage.value += 1;
      await loadEntries();
    };

    const handleClickOutside = (event) => {
      if (
        fieldSelectWrapperRef.value &&
        !fieldSelectWrapperRef.value.contains(event.target)
      ) {
        fieldDropdownOpen.value = false;
      }

      if (
        entrySelectWrapperRef.value &&
        !entrySelectWrapperRef.value.contains(event.target)
      ) {
        entryDropdownOpen.value = false;
      }
    };

    const buildPayload = () => ({
      field: form.field,
      cropRotationEntry: form.cropRotationEntry,
      plannedStartDate: form.plannedStartDate || null,
      plannedEndDate: form.plannedEndDate || null,
      status: form.status,
      notes: form.notes || null,
    });

    const submitForm = async () => {
      if (!form.field) {
        alert("Выберите поле");
        return;
      }

      if (!form.cropRotationEntry) {
        alert("Выберите запись севооборота");
        return;
      }

      try {
        submitting.value = true;

        let response;
        if (props.mode === "create") {
          response = await agroPlanApi.createPlan(buildPayload());
        } else {
          response = await agroPlanApi.updatePlan(
            props.plan._id,
            buildPayload(),
          );
        }

        emit("saved", response.data);
      } catch (error) {
        console.error("Ошибка сохранения агроплана", error);
        alert(error.response?.data?.message || "Не удалось сохранить агроплан");
      } finally {
        submitting.value = false;
      }
    };

    watch(
      () => props.plan,
      async () => {
        await fillForm();
      },
      { immediate: true },
    );

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
      clearTimeout(fieldSearchTimeout);
      clearTimeout(entrySearchTimeout);
    });

    return {
      form,
      submitting,

      selectedField,
      selectedEntry,

      fieldSearch,
      fieldDropdownOpen,
      fieldOptions,
      loadingFields,
      fieldsError,
      fieldCurrentPage,
      fieldTotalPages,
      fieldSelectWrapperRef,

      entrySearch,
      entryDropdownOpen,
      entryOptions,
      loadingEntries,
      entriesError,
      entryCurrentPage,
      entryTotalPages,
      entrySelectWrapperRef,

      formatEntryLabel,
      openFieldDropdown,
      openEntryDropdown,
      handleFieldSearchInput,
      handleEntrySearchInput,
      selectField,
      selectEntry,
      goToPreviousFieldPage,
      goToNextFieldPage,
      goToPreviousEntryPage,
      goToNextEntryPage,
      submitForm,
    };
  },
};
</script>

<style scoped>
.large-form {
  width: 700px;
  max-width: 95vw;
}

.select-wrapper {
  position: relative;
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 30;
  background: #fff;
  border: 1px solid #000;
  max-height: 320px;
  overflow-y: auto;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  border: none;
  border-bottom: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f3f3f3;
}

.dropdown-state {
  padding: 12px;
  text-align: center;
}

.dropdown-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-top: 1px solid #ddd;
  background: #fff;
  position: sticky;
  bottom: 0;
}

.page-indicator {
  font-size: 14px;
}

.selected-field-hint {
  margin-top: 8px;
  font-size: 14px;
}

.small-button {
  padding: 6px 10px;
  border: 1px solid #000;
  background: #fff;
  cursor: pointer;
}

.small-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #8b0000;
}
</style>
