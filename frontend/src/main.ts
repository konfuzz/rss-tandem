import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import PrimeVue from 'primevue/config';
import { createApp } from 'vue';

import App from './App.vue';
import './style.css';
import router from './router';

createApp(App)
  .use(router)
  .use(createPinia().use(piniaPluginPersistedstate))
  .use(PrimeVue, {
    theme: {
      options: {
        cssLayer: false,
        darkModeSelector: '.p-dark',
        prefix: 'p',
      },
      preset: Aura,
    },
  })
  .mount('#app');
