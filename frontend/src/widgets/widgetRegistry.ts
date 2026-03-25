import type { Component } from 'vue';

import { defineAsyncComponent } from 'vue';

import type { questionType } from '../types/widget';

export const widgetRegistry: Partial<Record<questionType, Component>> = {
  'ai-interviewer': defineAsyncComponent(() => import('./ai-interviewer/Ai-interviewer.vue')),
  'basic-poll': defineAsyncComponent(() => import('./poll/PollWidget.vue')),
  'code-analysis': defineAsyncComponent(() => import('./codeAnalysis/CodeAnalysisWidget.vue')),
  'drag-n-drop': defineAsyncComponent(() => import('./MethodBuilder/MethodBuilderWidget.vue')),
  example: defineAsyncComponent(() => import('./WidgetExample.vue')),
  'multiple-choice': defineAsyncComponent(() => import('./multipleChoice/MultipleChoiceWidget.vue')),
};
