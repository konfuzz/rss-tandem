import type { Component } from 'vue';

import { defineAsyncComponent } from 'vue';

import type { questionType } from '../types/widget';

export const widgetRegistry: Partial<Record<questionType, Component>> = {
  'ai-interviewer': defineAsyncComponent(() => import('./ai-interviewer/Ai-interviewer.vue')),
  example: defineAsyncComponent(() => import('./WidgetExample.vue')),
};
