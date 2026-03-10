<template>
  <div class="form-overlay">
    <div class="standart-form crop-selection-form">
      <router-link to="/crop-rotation/compatibility">
        <button type="button" class="close-button">
          <img src="/assets/close.svg" alt="Закрыть" class="close-icon" />
        </button>
      </router-link>

      <h2>Подбор культуры</h2>

      <form @submit.prevent="submitForm">
        <div class="standart-form-group">
          <label for="field-search">Поле:</label>

          <div class="select-wrapper" ref="selectWrapperRef">
            <input
              id="field-search"
              v-model="fieldSearch"
              type="text"
              class="standart-input"
              placeholder="Введите название поля..."
              autocomplete="off"
              @focus="openDropdown"
              @input="handleSearchInput"
            />

            <div v-if="dropdownOpen" class="dropdown">
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
                    :disabled="currentPage <= 1 || loadingFields"
                    @click="goToPreviousPage"
                  >
                    Назад
                  </button>

                  <span class="page-indicator">
                    Страница {{ currentPage }} из {{ totalPages }}
                  </span>

                  <button
                    type="button"
                    class="small-button"
                    :disabled="currentPage >= totalPages || loadingFields"
                    @click="goToNextPage"
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
          <label for="budget">Бюджет:</label>
          <input
            id="budget"
            v-model.number="form.budget"
            type="number"
            class="standart-input"
            step="0.01"
            min="0"
            placeholder="Введите бюджет"
          />
        </div>

        <div v-if="formError" class="form-error">
          {{ formError }}
        </div>

        <div class="standart-form-group">
          <button type="submit" class="form-button">Добавить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { fieldApi } from "@/services/api";

export default {
  name: "CropSelectionForm",
  setup() {
    const router = useRouter();
    const selectWrapperRef = ref(null);
    const form = ref({
      field: "",
      budget: null,
    });

    const fieldSearch = ref("");
    const selectedField = ref(null);

    const dropdownOpen = ref(false);
    const loadingFields = ref(false);
    const fieldsError = ref("");
    const formError = ref("");

    const fieldOptions = ref([]);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const limit = ref(10);

    let searchTimeout = null;

    const normalizeFieldsResponse = (response) => {
      const data = response?.data || response || {};

      const items = data.items || data.fields || data.data || data.docs || [];

      const pagination = data.pagination || {};

      return {
        items: Array.isArray(items) ? items : [],
        currentPage:
          data.page || pagination.page || pagination.currentPage || 1,
        totalPages: data.totalPages || pagination.pages || 1,
      };
    };

    const fetchFields = async (page = 1, search = fieldSearch.value) => {
      loadingFields.value = true;
      fieldsError.value = "";

      try {
        const response = await fieldApi.getAll({
          page,
          limit: limit.value,
          search,
        });

        const normalized = normalizeFieldsResponse(response);

        fieldOptions.value = normalized.items;
        currentPage.value = normalized.currentPage;
        totalPages.value =
          normalized.totalPages > 0 ? normalized.totalPages : 1;
      } catch (error) {
        fieldsError.value =
          error?.response?.data?.message || "Не удалось загрузить список полей";
        fieldOptions.value = [];
        currentPage.value = 1;
        totalPages.value = 1;
      } finally {
        loadingFields.value = false;
      }
    };

    const openDropdown = async () => {
      dropdownOpen.value = true;

      if (fieldOptions.value.length === 0) {
        await fetchFields(1, fieldSearch.value);
      }
    };

    const selectField = (field) => {
      selectedField.value = field;
      form.value.field = field._id;
      fieldSearch.value = field.name;
      dropdownOpen.value = false;
      formError.value = "";
    };

    const handleSearchInput = () => {
      selectedField.value = null;
      form.value.field = "";
      currentPage.value = 1;

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      searchTimeout = setTimeout(() => {
        fetchFields(1, fieldSearch.value);
      }, 300);
    };

    const goToPreviousPage = async () => {
      if (currentPage.value <= 1) {
        return;
      }

      await fetchFields(currentPage.value - 1, fieldSearch.value);
    };

    const goToNextPage = async () => {
      if (currentPage.value >= totalPages.value) {
        return;
      }

      await fetchFields(currentPage.value + 1, fieldSearch.value);
    };

    const handleOutsideClick = (event) => {
      if (
        selectWrapperRef.value &&
        !selectWrapperRef.value.contains(event.target)
      ) {
        dropdownOpen.value = false;
      }
    };

    const submitForm = () => {
      formError.value = "";

      if (!form.value.field || !selectedField.value) {
        formError.value = "Выберите поле из списка";
        return;
      }

      router.push({
        path: "/crop-rotation/crop-selection",
        query: {
          fieldId: selectedField.value._id,
          fieldName: selectedField.value.name,
          budget:
            form.value.budget !== null && form.value.budget !== undefined
              ? String(form.value.budget)
              : "",
        },
      });
    };

    onMounted(async () => {
      document.addEventListener("click", handleOutsideClick);
      await fetchFields();
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleOutsideClick);

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    });

    return {
      form,
      fieldSearch,
      selectedField,
      dropdownOpen,
      loadingFields,
      fieldsError,
      formError,
      fieldOptions,
      currentPage,
      totalPages,
      openDropdown,
      selectField,
      handleSearchInput,
      goToPreviousPage,
      goToNextPage,
      submitForm,
    };
  },
};
</script>

<style scoped>
.crop-selection-form {
  position: relative;
  min-width: 520px;
  max-width: 520px;
}

.select-wrapper {
  position: relative;
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #000;
  border-radius: 6px;
  z-index: 50;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  background: #fff;
  border: none;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f3f3f3;
}

.dropdown-state {
  padding: 12px;
}

.dropdown-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #ddd;
  background: #fafafa;
}

.small-button {
  padding: 6px 10px;
  border: 1px solid #000;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.small-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-indicator {
  font-size: 14px;
}

.selected-field-hint {
  margin-top: 6px;
  font-size: 14px;
}

.form-error,
.error-text {
  color: #c62828;
}
</style>
