export type questionType =
  | 'ai-interviewer'
  | 'basic-poll'
  | 'code-analysis'
  | 'drag-n-drop'
  | 'example'
  | 'multiple-choice';

export interface QuizTask {
  answers?: string[];
  question?: string;
  questionImage?: string;
}

export interface WidgetConfig {
  props?: Record<string, unknown>;
  type: questionType;
}
