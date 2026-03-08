<template>
  <main class="main-content">
    <div class="tile-container">
      <router-link to="/forecast/yield" class="tile">
        <h3 class="tile-title">Прогноз урожайности</h3>
        <p class="tile-description">На основе текущих показателей и исторических данных</p>
      </router-link>

      <router-link to="/forecast/weather" class="tile">
        <h3 class="tile-title">Погодные риски</h3>
        <p class="tile-description">Прогноз заморозков, засух и осадков</p>
      </router-link>

      <router-link to="/forecast/pests" class="tile">
        <h3 class="tile-title">Риск вредителей</h3>
        <p class="tile-description">Прогноз активности насекомых и болезней</p>
      </router-link>

      <router-link to="/forecast/market" class="tile">
        <h3 class="tile-title">Рыночный прогноз</h3>
        <p class="tile-description">Ожидаемые цены на урожай</p>
      </router-link>

      <router-link to="/forecast/irrigation" class="tile">
        <h3 class="tile-title">Потребность в поливе</h3>
        <p class="tile-description">Рекомендации по орошению</p>
      </router-link>

      <router-link to="/forecast/growth" class="tile">
        <h3 class="tile-title">График роста</h3>
        <p class="tile-description">Прогноз этапов развития культур</p>
      </router-link>
    </div>
  </main>
</template>

<script>
export default {
  name: 'Forecasting',
};
</script>

<style scoped>
/* Стили плиток из tile_style.css */
</style>