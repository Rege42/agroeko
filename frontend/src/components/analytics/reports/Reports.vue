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
        { id: 'daily', title: 'Ежедневный отчет', description: 'Ключевые показатели за день' },
        { id: 'weekly', title: 'Недельный отчет', description: 'Сводка за 7 дней' },
        { id: 'monthly', title: 'Месячный отчет', description: 'Анализ продуктивности' },
        { id: 'seasonal', title: 'Сезонный отчет', description: 'Итоги сезона' },
        { id: 'fields', title: 'По полям', description: 'Сравнительная аналитика' },
        { id: 'export', title: 'Экспорт данных', description: 'Выгрузка в Excel/PDF' },
      ],
    };
  },
};
</script>

<style scoped>
/* Стили плиток уже глобальные, можно оставить пустым или добавить свои */
</style>