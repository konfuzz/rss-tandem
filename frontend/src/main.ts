import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import { createApp } from 'vue';

import './style.css';
import App from './App.vue';

createApp(App)
  .use(PrimeVue, {
    theme: {
      options: {
        cssLayer: false,
        darkModeSelector: 'system',
        prefix: 'p',
      },
      preset: Aura,
    },
  })
  .mount('#app');
