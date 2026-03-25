export type questionType =
  | 'ai-interviewer'
  | 'basic-poll'
  | 'code-analysis'
  | 'drag-n-drop'
  | 'example'
  | 'multiple-choice';
export interface WidgetConfig {
  props?: Record<string, unknown>;
  type: questionType;
}
