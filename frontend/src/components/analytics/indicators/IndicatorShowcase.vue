<template>
  <main class="main-content">
    <div class="showcase">
      <div class="showcase-header">
        <h2 class="showcase-title">{{ title }}</h2>
        <span class="showcase-badge">{{ indicatorId }}</span>
      </div>
      <div class="showcase-content">
        <div v-if="loading" class="loading-placeholder">
          <p>Данные загружаются...</p>
          <div class="progress-bar"></div>
        </div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else class="data-placeholder">
          <img src="/assets/yield_2024.png" alt="placeholder" class="showcase-image" />
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'IndicatorShowcase',
  setup() {
    const route = useRoute();
    const indicatorId = route.params.id;
    const loading = ref(true);
    const error = ref(null);

    const title = computed(() => {
      const titles = {
        yield: 'Урожайность',
        humidity: 'Влажность',
        temperature: 'Температура',
        illumination: 'Освещенность',
        ph: 'pH почвы',
        nitrogen: 'Азот',
        phosphorus: 'Фосфор',
        potassium: 'Калий',
      };
      return titles[indicatorId] || 'Показатель';
    });

    // Имитация загрузки (позже заменится на реальный запрос)
    onMounted(() => {
      setTimeout(() => {
        loading.value = false;
      }, 1000);
    });

    return {
      indicatorId,
      loading,
      error,
      title,
    };
  },
};
</script>

<style scoped>
.loading-placeholder {
  text-align: center;
  padding: 50px;
}
.progress-bar {
  width: 60%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 15px auto 0;
  overflow: hidden;
  position: relative;
}
.progress-bar::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 30%;
  background: #7D5C45;
  animation: progress 1.5s ease-in-out infinite;
}
@keyframes progress {
  0% { left: -30%; width: 30%; }
  50% { left: 50%; width: 40%; }
  100% { left: 100%; width: 30%; }
}
.data-placeholder {
  text-align: center;
}
.showcase-image {
  max-width: 100%;
  border-radius: 8px;
}
.error {
  color: #c62828;
  text-align: center;
  padding: 20px;
}
</style>