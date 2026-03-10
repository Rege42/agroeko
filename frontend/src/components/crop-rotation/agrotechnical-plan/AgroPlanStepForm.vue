<template>
  <div class="form-overlay">
    <div class="standart-form">
      <button class="close-button" @click="$emit('close')">
        <img src="/assets/close.svg" alt="Закрыть" class="close-icon" />
      </button>

      <h2>{{ mode === 'create' ? 'Создание шага' : 'Редактирование шага' }}</h2>

      <form @submit.prevent="submitForm">
        <div class="standart-form-group">
          <label for="order">Порядок:</label>
          <input
            id="order"
            v-model.number="form.order"
            class="standart-input"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="standart-form-group">
          <label for="name">Название этапа:</label>
          <input
            id="name"
            v-model="form.name"
            class="standart-input"
            type="text"
            maxlength="150"
            required
          />
        </div>

        <div class="standart-form-group">
          <label for="stepType">Тип этапа:</label>
          <select id="stepType" v-model="form.stepType" class="standart-input">
            <option value="soil_preparation">Подготовка почвы</option>
            <option value="sowing">Посев</option>
            <option value="fertilizing">Внесение удобрений</option>
            <option value="protection">Защита растений</option>
            <option value="monitoring">Мониторинг</option>
            <option value="harvesting">Уборка урожая</option>
            <option value="other">Прочее</option>
          </select>
        </div>

        <div class="standart-form-group">
          <label for="plannedDate">Плановая дата:</label>
          <input
            id="plannedDate"
            v-model="form.plannedDate"
            class="standart-input"
            type="date"
          />
        </div>

        <div class="standart-form-group">
          <label for="actualDate">Фактическая дата:</label>
          <input
            id="actualDate"
            v-model="form.actualDate"
            class="standart-input"
            type="date"
          />
        </div>

        <div class="standart-form-group">
          <label for="status">Статус:</label>
          <select id="status" v-model="form.status" class="standart-input">
            <option value="pending">Ожидает</option>
            <option value="in_progress">Выполняется</option>
            <option value="completed">Завершён</option>
            <option value="skipped">Пропущен</option>
            <option value="overdue">Просрочен</option>
          </select>
        </div>

        <div class="standart-form-group">
          <label for="deviationReason">Причина отклонения:</label>
          <textarea
            id="deviationReason"
            v-model="form.deviationReason"
            class="standart-input"
            rows="3"
          />
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

        <button class="form-button" type="submit" :disabled="submitting">
          {{ submitting ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, watch, ref } from 'vue';
import {agroPlanApi, fieldApi} from "@/services/api";

export default {
  name: 'AgroPlanStepForm',
  props: {
    mode: {
      type: String,
      default: 'create',
    },
    step: {
      type: Object,
      default: null,
    },
    agroPlanId: {
      type: String,
      required: true,
    },
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const submitting = ref(false);

    const form = reactive({
      order: 1,
      name: '',
      stepType: 'other',
      plannedDate: '',
      actualDate: '',
      status: 'pending',
      deviationReason: '',
      notes: '',
    });

    const toInputDate = (value) => {
      if (!value) return '';
      return new Date(value).toISOString().slice(0, 10);
    };

    const fillForm = () => {
      form.order = props.step?.order || 1;
      form.name = props.step?.name || '';
      form.stepType = props.step?.stepType || 'other';
      form.plannedDate = toInputDate(props.step?.plannedDate);
      form.actualDate = toInputDate(props.step?.actualDate);
      form.status = props.step?.status || 'pending';
      form.deviationReason = props.step?.deviationReason || '';
      form.notes = props.step?.notes || '';
    };

    watch(
      () => props.step,
      () => fillForm(),
      { immediate: true }
    );

    const buildPayload = () => ({
      agroPlan: props.agroPlanId,
      order: form.order,
      name: form.name,
      stepType: form.stepType,
      plannedDate: form.plannedDate || null,
      actualDate: form.actualDate || null,
      status: form.status,
      deviationReason: form.deviationReason || null,
      notes: form.notes || null,
    });

    const submitForm = async () => {
      try {
        submitting.value = true;

        if (props.mode === 'create') {
          await agroPlanApi.createStep(buildPayload());
        } else {
          await agroPlanApi.updateStep(props.step._id, buildPayload());
        }

        emit('saved');
      } catch (error) {
        console.error('Ошибка сохранения шага', error);
        alert(error.response?.data?.message || 'Не удалось сохранить шаг агроплана');
      } finally {
        submitting.value = false;
      }
    };

    return {
      form,
      submitting,
      submitForm,
    };
  },
};
</script>