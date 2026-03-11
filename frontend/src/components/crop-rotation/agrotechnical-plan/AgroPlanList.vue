<template>
  <div style="padding-left:60px;padding-top:60px">
    <div class="search-bar">
      <input
        id="field-search"
        v-model="searchQuery"
        class="standart-input medium-width"
        type="text"
        placeholder="Введите название поля..."
        @keyup.enter="search"
      />
      <button class="standart-button" @click="search">Найти</button>

      <button class="standart-button" @click="openCreatePlanForm">
        Добавить план
      </button>

      <h3 class="right-position" style="color:#333">
        {{ selectedFieldName || "Агротехнический план" }}
      </h3>
    </div>

    <div class="content-wrapper">
      <div class="plans-panel" style="color:#333">
        <h2>Планы</h2>

        <div v-if="loading" class="empty-message" style="color:#333">Загрузка...</div>
        <div v-else-if="filteredPlans.length === 0" class="empty-message" style="color:#333">
          Планы не найдены
        </div>

        <div
          v-for="plan in filteredPlans"
          :key="plan._id"
          class="plan-card"
          :class="{ active: selectedPlan && selectedPlan._id === plan._id }"
          @click="selectPlan(plan)"
        >
          <div><strong>Поле:</strong> {{ plan.field?.name || "—" }}</div>
          <div>
            <strong  style="color:#333;">Статус:</strong> {{ formatPlanStatus(plan.status) }}
          </div>
          <div>
            <strong  style="color:#333;">Период:</strong> {{ formatDate(plan.plannedStartDate) }} —
            {{ formatDate(plan.plannedEndDate) }}
          </div>
        </div>
      </div>

      <div class="steps-panel">
        <div class="actions-bar" v-if="selectedPlan">
          <button class="standart-button" @click="openEditPlanForm">
            Изменить план
          </button>
          <button class="standart-button delete-button" @click="deletePlan">
            Удалить план
          </button>
          <button class="standart-button" @click="openCreateStepForm">
            Добавить шаг
          </button>
        </div>

        <div v-if="selectedPlan" class="plan-info-block">
          <p><strong  style="color:#333;">Поле:</strong> {{ selectedPlan.field?.name || "—" }}</p>
          <p>
            <strong  style="color:#333;">Статус:</strong> {{ formatPlanStatus(selectedPlan.status) }}
          </p>
          <p>
            <strong  style="color:#333;">Дата начала:</strong>
            {{ formatDate(selectedPlan.plannedStartDate) }}
          </p>
          <p>
            <strong  style="color:#333;">Дата окончания:</strong>
            {{ formatDate(selectedPlan.plannedEndDate) }}
          </p>
          <p><strong  style="color:#333;">Примечание:</strong> {{ selectedPlan.notes || "—" }}</p>
        </div>

        <table
          class="standart-table full-width margin-top-30px"
          v-if="selectedPlan"
        >
          <thead>
            <tr  style="color:#333;">
              <th>№</th>
              <th>Этап</th>
              <th>Тип</th>
              <th>Плановая дата</th>
              <th>Фактическая дата</th>
              <th>Статус</th>
              <th>Причина отклонения</th>
              <th>Примечание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody  style="color:#333;">
            <tr v-if="steps.length === 0">
              <td colspan="9">Шаги отсутствуют</td>
            </tr>

            <tr v-for="step in steps" :key="step._id">
              <td>{{ step.order }}</td>
              <td>{{ step.name }}</td>
              <td>{{ formatStepType(step.stepType) }}</td>
              <td>{{ formatDate(step.plannedDate) }}</td>
              <td>{{ formatDate(step.actualDate) }}</td>
              <td>{{ formatStepStatus(step.status) }}</td>
              <td>{{ step.deviationReason || "—" }}</td>
              <td>{{ step.notes || "—" }}</td>
              <td class="actions-cell">
                <button class="standart-button" @click="openEditStepForm(step)">
                  Изменить
                </button>
                <button
                  class="delete-button standart-button "
                  @click="deleteStep(step._id)"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-message">
          Выберите агроплан из списка слева
        </div>
      </div>
    </div>

    <AgroPlanForm
      v-if="showPlanForm"
      :mode="planFormMode"
      :plan="editingPlan"
      @close="closePlanForm"
      @saved="handlePlanSaved"
    />

    <AgroPlanStepForm
      v-if="showStepForm"
      :mode="stepFormMode"
      :step="editingStep"
      :agro-plan-id="selectedPlan?._id"
      @close="closeStepForm"
      @saved="handleStepSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import AgroPlanForm from "./AgroPlanForm.vue";
import AgroPlanStepForm from "./AgroPlanStepForm.vue";
import { agroPlanApi } from '@/services/api';

export default {
  name: "AgroPlanList",
  components: {
    AgroPlanForm,
    AgroPlanStepForm,
  },
  setup() {
    const loading = ref(false);
    const searchQuery = ref("");
    const plans = ref([]);
    const steps = ref([]);
    const selectedPlan = ref(null);
    const selectedFieldName = ref("");

    const showPlanForm = ref(false);
    const planFormMode = ref("create");
    const editingPlan = ref(null);

    const showStepForm = ref(false);
    const stepFormMode = ref("create");
    const editingStep = ref(null);

    const filteredPlans = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();

      if (!query) return plans.value;

      return plans.value.filter((plan) =>
        (plan.field?.name || "").toLowerCase().includes(query),
      );
    });

    const loadPlans = async () => {
      try {
        loading.value = true;
        const response = await agroPlanApi.getPlans();
        plans.value = response.items || [];
      } catch (error) {
        console.error("Ошибка загрузки агропланов", error);
        alert(
          error.response?.data?.message || "Не удалось загрузить агропланы",
        );
      } finally {
        loading.value = false;
      }
    };

    const loadSteps = async (agroPlanId) => {
      try {
        const response = await agroPlanApi.getSteps({ agroPlan: agroPlanId });
        steps.value = response.items || [];
      } catch (error) {
        console.error("Ошибка загрузки шагов", error);
        alert(
          error.response?.data?.message ||
            "Не удалось загрузить шаги агроплана",
        );
      }
    };

    const selectPlan = async (plan) => {
      selectedPlan.value = plan;
      selectedFieldName.value = plan.field?.name || "Агротехнический план";
      await loadSteps(plan._id);
    };

    const search = () => {
      if (!filteredPlans.value.length) {
        selectedPlan.value = null;
        selectedFieldName.value = "";
        steps.value = [];
        return;
      }

      selectPlan(filteredPlans.value[0]);
    };

    const openCreatePlanForm = () => {
      planFormMode.value = "create";
      editingPlan.value = null;
      showPlanForm.value = true;
    };

    const openEditPlanForm = () => {
      if (!selectedPlan.value) return;
      planFormMode.value = "edit";
      editingPlan.value = selectedPlan.value;
      showPlanForm.value = true;
    };

    const closePlanForm = () => {
      showPlanForm.value = false;
      editingPlan.value = null;
    };

    const handlePlanSaved = async (savedPlan) => {
      closePlanForm();
      await loadPlans();

      const reloadedPlan = plans.value.find(
        (item) => item._id === savedPlan._id,
      );
      if (reloadedPlan) {
        await selectPlan(reloadedPlan);
      }
    };

    const deletePlan = async () => {
      if (!selectedPlan.value) return;
      if (!confirm("Удалить агроплан и все его шаги?")) return;

      try {
        await agroPlanApi.deletePlan(selectedPlan.value._id);
        selectedPlan.value = null;
        selectedFieldName.value = "";
        steps.value = [];
        await loadPlans();
      } catch (error) {
        console.error("Ошибка удаления агроплана", error);
        alert(error.response?.data?.message || "Не удалось удалить агроплан");
      }
    };

    const openCreateStepForm = () => {
      if (!selectedPlan.value) {
        alert("Сначала выберите агроплан");
        return;
      }

      stepFormMode.value = "create";
      editingStep.value = null;
      showStepForm.value = true;
    };

    const openEditStepForm = (step) => {
      stepFormMode.value = "edit";
      editingStep.value = step;
      showStepForm.value = true;
    };

    const closeStepForm = () => {
      showStepForm.value = false;
      editingStep.value = null;
    };

    const handleStepSaved = async () => {
      closeStepForm();
      if (selectedPlan.value?._id) {
        await loadSteps(selectedPlan.value._id);
      }
    };

    const deleteStep = async (stepId) => {
      if (!confirm("Удалить шаг агроплана?")) return;

      try {
        await agroPlanApi.deleteStep(stepId);
        await loadSteps(selectedPlan.value._id);
      } catch (error) {
        console.error("Ошибка удаления шага", error);
        alert(error.response?.data?.message || "Не удалось удалить шаг");
      }
    };

    const formatDate = (date) => {
      if (!date) return "—";
      return new Date(date).toLocaleDateString("ru-RU");
    };

    const formatPlanStatus = (status) => {
      const map = {
        draft: "Черновик",
        approved: "Утверждён",
        in_progress: "Выполняется",
        completed: "Завершён",
        cancelled: "Отменён",
      };
      return map[status] || status || "—";
    };

    const formatStepStatus = (status) => {
      const map = {
        pending: "Ожидает",
        in_progress: "Выполняется",
        completed: "Завершён",
        skipped: "Пропущен",
        overdue: "Просрочен",
      };
      return map[status] || status || "—";
    };

    const formatStepType = (type) => {
      const map = {
        soil_preparation: "Подготовка почвы",
        sowing: "Посев",
        fertilizing: "Внесение удобрений",
        protection: "Защита растений",
        monitoring: "Мониторинг",
        harvesting: "Уборка урожая",
        other: "Прочее",
      };
      return map[type] || type || "—";
    };

    onMounted(async () => {
      await loadPlans();
      if (plans.value.length > 0) {
        await selectPlan(plans.value[0]);
      }
    });

    return {
      loading,
      searchQuery,
      plans,
      steps,
      selectedPlan,
      selectedFieldName,
      filteredPlans,
      showPlanForm,
      planFormMode,
      editingPlan,
      showStepForm,
      stepFormMode,
      editingStep,
      search,
      selectPlan,
      openCreatePlanForm,
      openEditPlanForm,
      closePlanForm,
      handlePlanSaved,
      deletePlan,
      openCreateStepForm,
      openEditStepForm,
      closeStepForm,
      handleStepSaved,
      deleteStep,
      formatDate,
      formatPlanStatus,
      formatStepStatus,
      formatStepType,
    };
  },
};
</script>

<style scoped>
.content-wrapper {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.plans-panel {
  width: 320px;
  min-width: 320px;
}

.steps-panel {
  flex: 1;
}

.plan-card {
  border: 1px solid #000;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.plan-card.active {
  background-color: #f3f3f3;
  border-width: 2px;
}

.actions-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.plan-info-block {
  margin-bottom: 16px;
}

.empty-message {
  padding: 20px;
  text-align: center;
}

.small-button {
  padding: 6px 10px;
  border: 1px solid #000;
  background: #fff;
  cursor: pointer;
}

.delete-button {
  border-color: #8b0000;
}
</style>
