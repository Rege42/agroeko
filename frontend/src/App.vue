<template>
  <div id="app">
    <Header v-if="!currentRouteMeta.hideHeader" />
    <Sidebar v-if="!currentRouteMeta.hideSidebar" />
    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/layout/Header.vue';
import Sidebar from './components/layout/Sidebar.vue';

export default {
  name: 'App',
  components: { Header, Sidebar },

  setup() {
    const route = useRoute();

    const currentRouteMeta = computed(() => route.meta || {});

    return {
      currentRouteMeta,
    };
  },
};
</script>

<style>
/* Глобальные стили из HTML */
@import './styles/style.css';
@import './styles/style.css';
@import './styles/tile_style.css';
@import './styles/form_style.css';
@import './styles/showcase_style.css';
@import './styles/button_style.css';
@import './styles/input.css';
@import './styles/items.css';
@import './styles/variables.css';
</style>