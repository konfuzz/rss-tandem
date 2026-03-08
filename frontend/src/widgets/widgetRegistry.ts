import type { Component } from 'vue';

import { defineAsyncComponent } from 'vue';

import type { WidgetType } from '../types/widget';

export const widgetRegistry: Partial<Record<WidgetType, Component>> = {
  example: defineAsyncComponent(() => import('./WidgetExample.vue')),
};
