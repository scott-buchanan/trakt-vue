import { createApp } from 'vue';
import { Quasar } from 'quasar';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import quasarUserOptions from './quasar-user-options';

const pinia = createPinia();
const app = createApp(App);

app.use(Quasar, quasarUserOptions).use(router).use(pinia);

app.mount('#app');
