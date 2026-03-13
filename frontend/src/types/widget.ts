export type questionType = 'ai-interviewer' | 'basic-poll' | 'drag-n-drop' | 'example';
export interface WidgetConfig {
  props?: Record<string, string>;
  type: questionType;
}
