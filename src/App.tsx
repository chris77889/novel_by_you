import React, { useState, useEffect } from 'react';
import StyleSelectionScreen from './components/StyleSelectionScreen';
import NovelReadingScreen from './components/NovelReadingScreen';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import { NovelStyle } from './types';
import { novelStyles } from './data/novelStyles';
import { generateInitialStoryAndChoices, handleAiError } from './services/aiService';
import { useNovelStore } from './store/novelStore';
import { useThemeStore } from './components/ThemeSwitcher';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'style' | 'novel'>('style');
  const [selectedStyle, setSelectedStyle] = useState<NovelStyle | null>(null);
  const [storyContent, setStoryContent] = useState<string>('');
  const [currentChoices, setCurrentChoices] = useState<Array<{id: string, text: string}>>([]);
  const [history, setHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const { histories, addHistory, updateHistory, syncWithSupabase } = useNovelStore();
  const { user, setUser } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(data);
              syncWithSupabase();
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          setUser(data);
          syncWithSupabase();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, syncWithSupabase]);

  const handleStyleSelect = async (style: NovelStyle) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSelectedStyle(style);
    setIsLoading(true);
    setError(null);
    
    try {
      const { story, choices } = await generateInitialStoryAndChoices(
        style.prompt,
        'creative'
      );
      
      const newHistory = {
        id: crypto.randomUUID(),
        style,
        lastUpdated: Date.now(),
        content: story,
        choices,
        history: [{ role: 'assistant' as const, content: story }]
      };
      
      await addHistory(newHistory);
      
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
      setCurrentScreen('novel');
    }
  };

  const handleStoryUpdate = async (
    content: string,
    choices: Array<{id: string, text: string}>,
    historyItems: Array<{role: 'user' | 'assistant', content: string}>
  ) => {
    if (selectedStyle && histories.length > 0) {
      await updateHistory(histories[0].id, {
        content,
        choices,
        history: historyItems
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
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onUpdate={handleStoryUpdate}
          />
          <Navigation 
            onHome={() => setCurrentScreen('style')}
            onSelectHistory={handleSelectHistory}
          />
        </>
      )}
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

export default App;