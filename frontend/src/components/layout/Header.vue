<template>
  <header class="header">
    <router-link to="/" class="logo">
      <img src="/assets/logo.png" alt="Логотип" class="logo-img" />
    </router-link>

    <div class="login-section">
      <button
        v-if="!isAuth"
        class="login-button"
        @click="goLogin"
      >
        <span class="login-text">Вход</span>
        <img src="/assets/login.png" alt="Иконка входа" class="login-icon" />
      </button>

      <button
        v-else
        class="login-button"
        @click="logoutUser"
      >
        <span class="login-text">Выход</span>
      </button>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router';
import { isAuth, logout } from '@/services/authService';

export default {
  name: 'Header',
  setup() {
    const router = useRouter();

    const goLogin = () => {
      router.push('/login');
    };

    const logoutUser = () => {
      logout();
      router.push('/login');
    };

    return {
      isAuth,
      goLogin,
      logoutUser,
    };
  },
};
</script>