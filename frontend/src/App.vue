<template>
  <div id="app">
    <Header />
    <Sidebar />
    <router-view />
  </div>
</template>

<script>
import Header from './components/layout/Header.vue';
import Sidebar from './components/layout/Sidebar.vue';

export default {
  name: 'App',
  components: { Header, Sidebar },
};
</script>

<style>
/* Глобальные стили из HTML */
@import './styles/style.css';
</style>