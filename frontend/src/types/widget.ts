export interface WidgetConfig {
  props?: Record<string, string>;
  type: WidgetType;
}

export type WidgetType = 'ai-interviewer' | 'basic-poll' | 'drag-n-drop' | 'example';
