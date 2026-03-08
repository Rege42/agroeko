import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/style.css';
import './styles/tile_style.css';
import './styles/form_style.css';
import './styles/showcase_style.css';

const app = createApp(App);
app.use(router);
app.mount('#app');