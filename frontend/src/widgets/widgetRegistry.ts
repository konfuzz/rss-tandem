import type { Component } from 'vue';

import { defineAsyncComponent } from 'vue';

import type { questionType } from '../types/widget';

export const widgetRegistry: Partial<Record<questionType, Component>> = {
  example: defineAsyncComponent(() => import('./WidgetExample.vue')),
};
