<template>
  <div>
    <div class="field-header">
      <h2 class="right-position" style="color:#333">
        Поле: {{  fieldName }}
      </h2>
    </div>

    <div class="container-crop-selection" style="padding-left: 80px; padding-top: 80px">
      <div class="left-panel-crop-selection">
        <div class="charts border-bottom-thin">
          <div class="chart">
            <canvas ref="chartPrev" width="300" height="300"></canvas>

            <div v-if="previousChartData.length" class="legend-chart">
              <span v-for="item in previousChartData" :key="item.cropId || item.cropName" style="color:#333">
                <div
                  class="color-circle"
                  :style="{ backgroundColor: item.color }"
                ></div>
                {{ item.cropName }} {{ item.percent }}%
              </span>
            </div>

            <div v-else class="info-text" style="color:#333">
              Нет данных по истории посевов
            </div>
          </div>

          <div class="chart border-left-thin">
            <canvas ref="chartNext" width="300" height="300"></canvas>

            <div v-if="recommendedChartData.length" class="legend-chart">
              <span v-for="item in recommendedChartData" :key="item.cropId || item.cropName" style="color:#333">
                <div
                  class="color-circle"
                  :style="{ backgroundColor: item.color }"
                ></div>
                {{ item.cropName }} {{ item.percent }}%
              </span>
            </div>

            <div v-else class="info-text" style="color:#333">
              Пока нет рекомендованных культур
            </div>
          </div>
        </div>

        <div class="info-text" style="color:#333">
          {{ summaryText }}
        </div>

        <div class="dynamic-text" style="color:#333">
          Прогнозируемая рентабельность:
          {{ profitabilityText }}
        </div>

        <div v-if="loading" class="loading-text" style="color:#333">
          Загрузка данных...
        </div>

        <div v-if="errorMessage" class="error-text" style="color:#333">
          {{ errorMessage }}
        </div>
      </div>

      <div class="right-panel-crop-selection border-left-thin">
        <div class="history-label border-bottom-thin" style="color:#333">История:</div>

        <ul class="history-list" v-if="historyList.length" style="color:#333">
          <li
            v-for="(crop, index) in historyList"
            :key="`${crop.cropId || crop.cropName}-${index}`"
          >
            {{ crop.cropName || 'Неизвестная культура' }}
          </li>
        </ul>

        <div v-else class="empty-history-text" style="color:#333">
          История посевов отсутствует
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Chart from 'chart.js/auto';
import { getCropSelection } from '@/services/api';

const CHART_COLORS = [
  '#ff6384',
  '#36a2eb',
  '#ffcd56',
  '#4bc0c0',
  '#9966ff',
  '#ff9f40',
  '#8bc34a',
  '#e91e63',
  '#009688',
  '#795548',
];

export default {
  name: 'CropSelection',
  setup() {
    const route = useRoute();

    const chartPrev = ref(null);
    const chartNext = ref(null);

    const prevChartInstance = ref(null);
    const nextChartInstance = ref(null);

    const loading = ref(false);
    const errorMessage = ref('');

    const cropSelectionData = ref({
      field: null,
      history: [],
      previousChart: [],
      recommendations: [],
      recommendedChart: [],
      summary: {
        text: '',
        profitabilityPercent: null,
      },
    });

    const fieldId = computed(() => {
      return route.params.fieldId || route.query.fieldId || null;
    });

    const fieldName = computed(() => {
      return cropSelectionData.value.field?.name || 'Поле';
    });

    const historyList = computed(() => {
      return Array.isArray(cropSelectionData.value.history)
        ? cropSelectionData.value.history
        : [];
    });

    const summaryText = computed(() => {
      return (
        cropSelectionData.value.summary?.text ||
        'Исходя из текущих показателей почв и истории севооборота предлагаются следующие доли культур для посадки.'
      );
    });

    const profitabilityText = computed(() => {
      const value = cropSelectionData.value.summary?.profitabilityPercent;
      return value == null ? 'н/д' : `${value}%`;
    });

    const previousChartData = computed(() => {
      const source = Array.isArray(cropSelectionData.value.previousChart)
        ? cropSelectionData.value.previousChart
        : [];

      return source.map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
    });

    const recommendedChartData = computed(() => {
      const source = Array.isArray(cropSelectionData.value.recommendedChart)
        ? cropSelectionData.value.recommendedChart
        : [];

      return source.map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
    });

    const destroyCharts = () => {
      if (prevChartInstance.value) {
        prevChartInstance.value.destroy();
        prevChartInstance.value = null;
      }

      if (nextChartInstance.value) {
        nextChartInstance.value.destroy();
        nextChartInstance.value = null;
      }
    };

    const renderPrevChart = () => {
      if (!chartPrev.value) {
        return;
      }

      if (prevChartInstance.value) {
        prevChartInstance.value.destroy();
      }

      const data = previousChartData.value;

      prevChartInstance.value = new Chart(chartPrev.value, {
        type: 'pie',
        data: {
          labels: data.length ? data.map(item => item.cropName) : ['Нет данных'],
          datasets: [
            {
              data: data.length ? data.map(item => item.percent) : [100],
              backgroundColor: data.length
                ? data.map(item => item.color)
                : ['#d9d9d9'],
            },
          ],
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}%`;
                },
              },
            },
          },
        },
      });
    };

    const renderRecommendedChart = () => {
      if (!chartNext.value) {
        return;
      }

      if (nextChartInstance.value) {
        nextChartInstance.value.destroy();
      }

      const data = recommendedChartData.value;

      nextChartInstance.value = new Chart(chartNext.value, {
        type: 'pie',
        data: {
          labels: data.length ? data.map(item => item.cropName) : ['Нет данных'],
          datasets: [
            {
              data: data.length ? data.map(item => item.percent) : [100],
              backgroundColor: data.length
                ? data.map(item => item.color)
                : ['#d9d9d9'],
            },
          ],
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}%`;
                },
              },
            },
          },
        },
      });
    };

    const renderCharts = async () => {
      await nextTick();
      renderPrevChart();
      renderRecommendedChart();
    };

    const loadCropSelection = async () => {
      if (!fieldId.value) {
        errorMessage.value = 'Не передан идентификатор поля';
        return;
      }

      loading.value = true;
      errorMessage.value = '';

      try {
        const response = await getCropSelection(fieldId.value);

        cropSelectionData.value = response?.data || {
          field: null,
          history: [],
          previousChart: [],
          recommendations: [],
          recommendedChart: [],
          summary: {
            text: '',
            profitabilityPercent: null,
          },
        };

        await renderCharts();
      } catch (error) {
        destroyCharts();
        errorMessage.value =
          error?.response?.data?.message || 'Не удалось загрузить данные по подбору культуры';
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await loadCropSelection();
    });

    onBeforeUnmount(() => {
      destroyCharts();
    });

    return {
      chartPrev,
      chartNext,
      loading,
      errorMessage,
      fieldName,
      historyList,
      previousChartData,
      recommendedChartData,
      summaryText,
      profitabilityText,
    };
  },
};
</script>