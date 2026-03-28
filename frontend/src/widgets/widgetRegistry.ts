import type { Component } from 'vue';

import type { questionType } from '../types/widget';

import AiInterviewer from './ai-interviewer/Ai-interviewer.vue';
import CodeAnalysisWidget from './codeAnalysis/CodeAnalysisWidget.vue';
import MethodBuilderWidget from './MethodBuilder/MethodBuilderWidget.vue';
import MultipleChoiceWidget from './multipleChoice/MultipleChoiceWidget.vue';
import PollWidget from './poll/PollWidget.vue';

export const widgetRegistry: Partial<Record<questionType, Component>> = {
  'ai-interviewer': AiInterviewer,
  'basic-poll': PollWidget,
  'code-analysis': CodeAnalysisWidget,
  'drag-n-drop': MethodBuilderWidget,
  'multiple-choice': MultipleChoiceWidget,
};
