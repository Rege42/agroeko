<template>
  <div>
    <div class="field-header">
      <h2 class="field-name right-position">Поле 1</h2>
    </div>

    <div class="container-crop-selection">
      <div class="left-panel-crop-selection">
        <div class="charts border-bottom-thin">
          <div class="chart">
            <canvas ref="chartPrev" width="300" height="300"></canvas>
            <div class="legend-chart">
              <span
                ><div class="color-circle" style="background-color: red"></div>
                Рожь 67%</span
              >
              <span
                ><div class="color-circle" style="background-color: yellow"></div>
                Пшеница 33%</span
              >
            </div>
          </div>
          <div class="chart border-left-thin">
            <canvas ref="chartNext" width="300" height="300"></canvas>
            <div class="legend-chart">
              <span
                ><div class="color-circle" style="background-color: deepskyblue"></div>
                Кукуруза 28%</span
              >
              <span
                ><div class="color-circle" style="background-color: red"></div>
                Подсолнечник 25%</span
              >
              <span
                ><div class="color-circle" style="background-color: limegreen"></div>
                Ячмень 47%</span
              >
            </div>
          </div>
        </div>
        <div class="info-text">
          Исходя из текущих показателей почв и истории севооборота предлагаются следующие доли культур для посадки.
        </div>
        <div class="dynamic-text">Прогнозируемая рентабельность: 33%</div>
      </div>

      <div class="right-panel-crop-selection border-left-thin">
        <div class="history-label border-bottom-thin">История:</div>
        <ul class="history-list">
          <li v-for="crop in history" :key="crop">{{ crop }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';

export default {
  name: 'CropSelection',
  setup() {
    const chartPrev = ref(null);
    const chartNext = ref(null);
    const history = ref(['Пшеница', 'Подсолнечник', 'Кукуруза', 'Ячмень', 'Пшеница']);

    onMounted(() => {
      new Chart(chartPrev.value, {
        type: 'pie',
        data: {
          labels: ['Рожь', 'Пшеница'],
          datasets: [{ data: [67, 33], backgroundColor: ['red', 'yellow'] }],
        },
        options: { responsive: false, plugins: { legend: { display: false } } },
      });

      new Chart(chartNext.value, {
        type: 'pie',
        data: {
          labels: ['Кукуруза', 'Подсолнечник', 'Ячмень'],
          datasets: [{ data: [28, 25, 47], backgroundColor: ['deepskyblue', 'red', 'limegreen'] }],
        },
        options: { responsive: false, plugins: { legend: { display: false } } },
      });
    });

    return { chartPrev, chartNext, history };
  },
};
</script>