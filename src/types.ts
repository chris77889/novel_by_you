export interface NovelStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  sampleText: string;
  imageUrl: string;
}

export interface StoryChoice {
  id: string;
  text: string;
}

export interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ThinkingHistoryItem {
  position: number;
  content: string;
}

export interface NovelHistory {
  id: string;
  style: NovelStyle;
  lastUpdated: number;
  content: string;
  choices: StoryChoice[];
  history: HistoryItem[];
  structureOutline?: string | null;
  structureThinkingHistory?: ThinkingHistoryItem[];
  preferenceThinkingHistory?: ThinkingHistoryItem[];
}

export interface EnhancedContinuationResponse {
  storyContinuation: string;
  choices: StoryChoice[];
  structureThinking?: string;
  preferenceThinking?: string;
}