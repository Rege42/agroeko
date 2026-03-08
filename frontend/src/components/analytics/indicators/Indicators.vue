<template>
  <main class="main-content">
    <div class="tile-container">
      <router-link
        v-for="item in indicators"
        :key="item.id"
        :to="`/indicators/${item.id}`"
        class="tile"
      >
        <h3 class="tile-title">{{ item.title }}</h3>
        <p class="tile-description">{{ item.description }}</p>
      </router-link>
    </div>
  </main>
</template>

<script>
export default {
  name: 'Indicators',
  data() {
    return {
      indicators: [
        { id: 'yield', title: 'Урожайность', description: 'Средняя урожайность по полям' },
        { id: 'humidity', title: 'Влажность', description: 'Текущий уровень влажности почвы' },
        { id: 'temperature', title: 'Температура', description: 'Среднесуточная температура' },
        { id: 'illumination', title: 'Освещенность', description: 'Уровень солнечной радиации' },
        { id: 'ph', title: 'pH почвы', description: 'Кислотно-щелочной баланс' },
        { id: 'nitrogen', title: 'Азот', description: 'Содержание азота в почве' },
        { id: 'phosphorus', title: 'Фосфор', description: 'Содержание фосфора в почве' },
        { id: 'potassium', title: 'Калий', description: 'Содержание калия в почве' },
      ],
    };
  },
};
</script>