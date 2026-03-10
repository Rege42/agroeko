<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="submitLogin">
      <h2>Вход</h2>

      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" required class="standart-input" />
      </div>

      <div class="form-group">
        <label>Пароль</label>
        <input
          v-model="password"
          type="password"
          required
          class="standart-input"
        />
      </div>

      <button class="standart-button" style="margin: 0 auto;" type="submit">Войти</button>

      <p v-if="error" class="error">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script>
import { login } from "@/services/authService";

export default {
  name: "LoginView",

  data() {
    return {
      email: "",
      password: "",
      error: null,
    };
  },

  methods: {
    async submitLogin() {
      try {
        await login(this.email, this.password);
        this.$router.push("/");
      } catch (e) {
        this.error = "Неверный логин или пароль";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}

.login-form {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.error {
  color: red;
}
</style>
