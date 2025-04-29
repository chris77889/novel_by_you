import React, { useState } from 'react';
import StyleSelectionScreen from './components/StyleSelectionScreen';
import NovelReadingScreen from './components/NovelReadingScreen';
import Navigation from './components/Navigation';
// Removed AuthModal import
import { NovelStyle, ThinkingHistoryItem } from './types';
import { novelStyles } from './data/novelStyles';
import { generateInitialStoryAndChoices, generateInitialStructure, handleAiError } from './services/aiService';
import { useNovelStore } from './store/novelStore';
import { useThemeStore } from './components/ThemeSwitcher';
// Removed useAuthStore import (or keep if user info is still displayed, but remove setUser)
// Removed supabase import

function App() {
  const [currentScreen, setCurrentScreen] = useState<'style' | 'novel'>('style');
  const [selectedStyle, setSelectedStyle] = useState<NovelStyle | null>(null);
  const [storyContent, setStoryContent] = useState<string>('');
  const [currentChoices, setCurrentChoices] = useState<Array<{id: string, text: string}>>([]);
  const [history, setHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [structureOutline, setStructureOutline] = useState<string | null>(null);
  const [structureThinkingHistory, setStructureThinkingHistory] = useState<ThinkingHistoryItem[]>([]);
  const [preferenceThinkingHistory, setPreferenceThinkingHistory] = useState<ThinkingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Removed showAuthModal state

  // Removed syncWithSupabase from destructuring
  const { histories, addHistory, updateHistory } = useNovelStore();
  // Removed user and setUser from useAuthStore
  const theme = useThemeStore((state) => state.theme);

  // Removed Supabase useEffect hook (lines 31-68 from original)

  const handleStyleSelect = async (style: NovelStyle) => {
    // Removed user check and setShowAuthModal call

    setSelectedStyle(style);
    setIsLoading(true);
    setError(null);

    try {
      // Generate initial story and structure (logic remains the same)
      const { story, choices } = await generateInitialStoryAndChoices(
        style.prompt,
        'creative'
      );
      const initialOutline = await generateInitialStructure(style.prompt, 'balanced');
      setStructureOutline(initialOutline);

      // Reset thinking history
      setStructureThinkingHistory([]);
      setPreferenceThinkingHistory([]);

      // Create new history entry (logic remains the same, uses local ID generation)
      const newHistory = {
        id: crypto.randomUUID(), // Use local ID
        style,
        lastUpdated: Date.now(),
        content: story,
        choices,
        history: [{ role: 'assistant' as const, content: story }],
        structureOutline: initialOutline,
        structureThinkingHistory: [],
        preferenceThinkingHistory: []
      };

      // Add history to the local store
      addHistory(newHistory); // No longer async or interacting with Supabase

      setStoryContent(story);
      setCurrentChoices(choices);
      setHistory([{ role: 'assistant', content: story }]);
      setCurrentScreen('novel');
    } catch (err) {
      const errorMessage = handleAiError(err as Error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (historyId: string) => {
    const selectedHistory = histories.find(h => h.id === historyId);
    if (selectedHistory) {
      setSelectedStyle(selectedHistory.style);
      setStoryContent(selectedHistory.content);
      setCurrentChoices(selectedHistory.choices);
      setHistory(selectedHistory.history);
      setStructureOutline(selectedHistory.structureOutline || null);
      setStructureThinkingHistory(selectedHistory.structureThinkingHistory || []);
      setPreferenceThinkingHistory(selectedHistory.preferenceThinkingHistory || []);
      setCurrentScreen('novel');
    }
  };

  // handleStoryUpdate remains largely the same, but updateHistory is now synchronous
  const handleStoryUpdate = ( // Removed async keyword
    content: string,
    choices: Array<{id: string, text: string}>,
    historyItems: Array<{role: 'user' | 'assistant', content: string}>,
    newStructureOutline?: string,
    updatedStructureThinkingHistory?: ThinkingHistoryItem[],
    updatedPreferenceThinkingHistory?: ThinkingHistoryItem[]
  ) => {
    if (selectedStyle && histories.length > 0) {
      if (newStructureOutline) {
        setStructureOutline(newStructureOutline);
      }
      if (updatedStructureThinkingHistory) {
        setStructureThinkingHistory(updatedStructureThinkingHistory);
      }
      if (updatedPreferenceThinkingHistory) {
        setPreferenceThinkingHistory(updatedPreferenceThinkingHistory);
      }

      // Update history in the local store
      updateHistory(histories[0].id, { // No longer async
        content,
        choices,
        history: historyItems,
        structureOutline: newStructureOutline || structureOutline,
        structureThinkingHistory: updatedStructureThinkingHistory || structureThinkingHistory,
        preferenceThinkingHistory: updatedPreferenceThinkingHistory || preferenceThinkingHistory
      });
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      {currentScreen === 'style' ? (
        <StyleSelectionScreen
          styles={novelStyles}
          onSelectStyle={handleStyleSelect}
          isLoading={isLoading}
          error={error}
          // Removed onAuthClick prop if it existed
        />
      ) : (
        <>
          <NovelReadingScreen
            storyContent={storyContent}
            currentChoices={currentChoices}
            setStoryContent={setStoryContent}
            setCurrentChoices={setCurrentChoices}
            history={history}
            setHistory={setHistory}
            structureOutline={structureOutline}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onUpdate={handleStoryUpdate}
            structureThinkingHistory={structureThinkingHistory}
            preferenceThinkingHistory={preferenceThinkingHistory}
          />
          <Navigation
            onHome={() => setCurrentScreen('style')}
            onSelectHistory={handleSelectHistory}
            // Removed user prop if it existed
          />
        </>
      )}
      {/* Removed AuthModal rendering */}
    </div>
  );
}

export default App;