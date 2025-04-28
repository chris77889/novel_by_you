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