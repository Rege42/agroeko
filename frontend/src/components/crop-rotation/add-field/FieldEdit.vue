<template>
  <div class="form-container">
    <form class="soil-form" @submit.prevent="saveField">
      <div v-if="formError" class="form-error">
        {{ formError }}
      </div>

      <div class="form-group">
        <label for="name">Название:</label>
        <input
          id="name"
          v-model.trim="field.name"
          type="text"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.name }"
          required
          @input="clearFieldError('name')"
        />
        <div v-if="fieldErrors.name" class="input-error-text">
          {{ fieldErrors.name }}
        </div>
      </div>

      <div class="form-group">
        <label for="area">Площадь (га):</label>
        <input
          id="area"
          v-model.number="field.area"
          type="number"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.area }"
          step="0.01"
          min="0"
          required
          @input="clearFieldError('area')"
        />
        <div v-if="fieldErrors.area" class="input-error-text">
          {{ fieldErrors.area }}
        </div>
      </div>

      <div class="form-group">
        <label for="precipitation">Осадки (мм):</label>
        <input
          id="precipitation"
          v-model.number="field.precipitation"
          type="number"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.precipitation }"
          min="0"
          @input="clearFieldError('precipitation')"
        />
        <div v-if="fieldErrors.precipitation" class="input-error-text">
          {{ fieldErrors.precipitation }}
        </div>
      </div>

      <div class="form-group">
        <label for="humidity">Влажность (%):</label>
        <input
          id="humidity"
          v-model.number="field.humidity"
          type="number"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.humidity }"
          step="0.01"
          min="0"
          max="100"
          @input="clearFieldError('humidity')"
        />
        <div v-if="fieldErrors.humidity" class="input-error-text">
          {{ fieldErrors.humidity }}
        </div>
      </div>

      <div class="form-group">
        <label for="temperature">Средняя температура (°C):</label>
        <input
          id="temperature"
          v-model.number="field.temperature"
          type="number"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.temperature }"
          step="0.01"
          @input="clearFieldError('temperature')"
        />
        <div v-if="fieldErrors.temperature" class="input-error-text">
          {{ fieldErrors.temperature }}
        </div>
      </div>

      <div class="form-group">
        <label for="ph">pH почвы:</label>
        <input
          id="ph"
          v-model.number="field.ph"
          type="number"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.ph }"
          step="0.1"
          min="0"
          max="14"
          @input="clearFieldError('ph')"
        />
        <div v-if="fieldErrors.ph" class="input-error-text">
          {{ fieldErrors.ph }}
        </div>
      </div>

      <div class="form-group">
        <label for="nutrientsLevel">Уровень питательных веществ:</label>
        <select
          id="nutrientsLevel"
          v-model="field.nutrientsLevel"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.nutrientsLevel }"
          @change="clearFieldError('nutrientsLevel')"
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
        <div v-if="fieldErrors.nutrientsLevel" class="input-error-text">
          {{ fieldErrors.nutrientsLevel }}
        </div>
      </div>

      <div class="form-group">
        <label for="organic">Содержание органики (%):</label>
        <input
          id="organic"
          v-model.number="field.organic"
          type="number"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.organic }"
          step="0.01"
          min="0"
          max="100"
          @input="clearFieldError('organic')"
        />
        <div v-if="fieldErrors.organic" class="input-error-text">
          {{ fieldErrors.organic }}
        </div>
      </div>

      <div class="form-group">
        <label for="soil-type">Тип почвы:</label>
        <select
          id="soil-type"
          v-model="field.soilType"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.soilType }"
          @change="clearFieldError('soilType')"
        >
          <option value="sandy">Песчаная</option>
          <option value="loam">Суглинистая</option>
          <option value="clay">Глинистая</option>
          <option value="chernozem">Чернозем</option>
          <option value="peat">Торфяная</option>
          <option value="saline">Солончак (Засоленная)</option>
          <option value="other">Другой</option>
        </select>
        <div v-if="fieldErrors.soilType" class="input-error-text">
          {{ fieldErrors.soilType }}
        </div>
      </div>

      <div class="form-group">
        <label for="soil-moisture">Влажность почвы (%):</label>
        <input
          id="soil-moisture"
          v-model.number="field.soilMoisture"
          type="number"
          class="standart-input"
          :class="{ 'input-error-border': fieldErrors.soilMoisture }"
          step="0.01"
          min="0"
          max="100"
          @input="clearFieldError('soilMoisture')"
        />
        <div v-if="fieldErrors.soilMoisture" class="input-error-text">
          {{ fieldErrors.soilMoisture }}
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="standart-button" :disabled="isSubmitting || isDeleting">
          {{ isSubmitting ? "Сохранение..." : "Сохранить" }}
        </button>

        <button
          type="button"
          class="standart-button danger-button"
          :disabled="isSubmitting || isDeleting"
          @click="deleteField"
        >
          {{ isDeleting ? "Удаление..." : "Удалить" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { fieldApi } from "@/services/api";

export default {
  name: "FieldEdit",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const fieldId = route.params.id;

    const field = ref({
      name: "",
      area: null,
      precipitation: null,
      humidity: null,
      temperature: null,
      ph: null,
      nutrientsLevel: "medium",
      organic: null,
      soilType: "loam",
      soilMoisture: null,
    });

    const formError = ref("");
    const fieldErrors = ref({});
    const isSubmitting = ref(false);
    const isDeleting = ref(false);

    const clearFieldError = (fieldName) => {
      if (fieldErrors.value[fieldName]) {
        const nextErrors = { ...fieldErrors.value };
        delete nextErrors[fieldName];
        fieldErrors.value = nextErrors;
      }

      if (formError.value) {
        formError.value = "";
      }
    };

    const mapServerErrors = (errors) => {
      const mappedErrors = {};

      errors.forEach((err) => {
        if (err.field) {
          mappedErrors[err.field] = err.message;
        }
      });

      fieldErrors.value = mappedErrors;
    };

    const loadField = async () => {
      formError.value = "";

      try {
        const response = await fieldApi.getById(fieldId);
        const data = response.data;

        field.value = {
          name: data.name ?? "",
          area: data.area ?? null,
          precipitation: data.precipitation ?? null,
          humidity: data.humidity ?? null,
          temperature: data.temperature ?? null,
          ph: data.ph ?? null,
          nutrientsLevel: data.nutrientsLevel ?? "medium",
          organic: data.organic ?? null,
          soilType: data.soilType ?? "loam",
          soilMoisture: data.soilMoisture ?? null,
        };
      } catch (error) {
        const data = error.response?.data;
        formError.value = data?.message || "Ошибка загрузки поля";
      }
    };

    const saveField = async () => {
      formError.value = "";
      fieldErrors.value = {};
      isSubmitting.value = true;

      try {
        await fieldApi.update(fieldId, field.value);
        router.push("/crop-rotation/fields");
      } catch (error) {
        const data = error.response?.data;

        if (data) {
          if (Array.isArray(data.errors) && data.errors.length > 0) {
            mapServerErrors(data.errors);
          } else if (data.message) {
            formError.value = data.message;
          } else {
            formError.value = "Ошибка сохранения поля";
          }
        } else {
          formError.value = "Ошибка соединения с сервером";
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    const deleteField = async () => {
      const confirmed = window.confirm("Удалить поле?");

      if (!confirmed) {
        return;
      }

      formError.value = "";
      isDeleting.value = true;

      try {
        await fieldApi.delete(fieldId);
        router.push("/crop-rotation/fields");
      } catch (error) {
        const data = error.response?.data;
        formError.value = data?.message || "Ошибка удаления поля";
      } finally {
        isDeleting.value = false;
      }
    };

    onMounted(loadField);

    return {
      field,
      formError,
      fieldErrors,
      isSubmitting,
      isDeleting,
      clearFieldError,
      saveField,
      deleteField,
    };
  },
};
</script>