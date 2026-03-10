<template>
  <main class="main-content">
    <div class="tile-container">
      <router-link
        v-for="report in reportTypes"
        :key="report.id"
        :to="{ path: '/reports/new', query: { type: report.id } }"
        class="tile"
      >
        <h3 class="tile-title">{{ report.title }}</h3>
        <p class="tile-description">{{ report.description }}</p>
      </router-link>
    </div>
  </main>
</template>

<script>
export default {
  name: 'Reports',
  data() {
    return {
      reportTypes: [
        { id: 'daily', title: 'Аналитический отчет', description: 'Выручка, затраты, прибыль за период' },
        { id: 'weekly', title: 'Отчет по урожайности', description: 'В разработке' },
        { id: 'monthly', title: 'Отчет по полям', description: 'В разработке' },
        { id: 'seasonal', title: 'Отчет по персоналу', description: 'В разработке' },
      ],
    };
  },
};
</script>

<style scoped>
/* Стили плиток уже глобальные, можно оставить пустым или добавить свои */
</style>