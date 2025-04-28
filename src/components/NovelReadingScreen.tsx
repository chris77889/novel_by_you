import React, { useEffect, useRef, useState } from 'react';
import { HistoryItem, StoryChoice } from '../types';
import LoadingIndicator from './LoadingIndicator';
import ChoiceList from './ChoiceList';
import BackToTop from './BackToTop';
import { continueStoryAndGenerateChoices, handleAiError } from '../services/aiService';
import { useThemeStore } from './ThemeSwitcher';

interface NovelReadingScreenProps {
  storyContent: string;
  currentChoices: StoryChoice[];
  setStoryContent: React.Dispatch<React.SetStateAction<string>>;
  setCurrentChoices: React.Dispatch<React.SetStateAction<StoryChoice[]>>;
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdate: (content: string, choices: StoryChoice[], history: HistoryItem[]) => void;
}

const NovelReadingScreen: React.FC<NovelReadingScreenProps> = ({
  storyContent,
  currentChoices,
  setStoryContent,
  setCurrentChoices,
  history,
  setHistory,
  isLoading,
  setIsLoading,
  onUpdate
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (!isLoading && choicesRef.current) {
      choicesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [storyContent, isLoading]);

  const handleScroll = () => {
    if (contentRef.current) {
      setShowBackToTop(contentRef.current.scrollTop > 300);
    }
  };

  const handleChoiceSelected = async (choice: StoryChoice) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    const userChoice = `> 你选择了：${choice.text}`;
    const updatedHistory = [
      ...history,
      { role: 'user', content: userChoice }
    ];
    setHistory(updatedHistory);
    
    const updatedContent = `${storyContent}\n\n${userChoice}\n\n`;
    setStoryContent(updatedContent);
    
    try {
      const { storyContinuation, choices } = await continueStoryAndGenerateChoices(
        updatedHistory,
        'creative'
      );
      
      const finalContent = updatedContent + storyContinuation;
      const finalHistory = [...updatedHistory, { role: 'assistant', content: storyContinuation }];
      
      setStoryContent(finalContent);
      setHistory(finalHistory);
      setCurrentChoices(choices);
      
      onUpdate(finalContent, choices, finalHistory);
    } catch (err) {
      const errorMessage = handleAiError(err as Error);
      setError(errorMessage);
      setCurrentChoices(currentChoices);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={contentRef} 
      className={`container mx-auto px-4 pt-20 pb-8 max-w-3xl h-screen overflow-y-auto ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
      }`}
      onScroll={handleScroll}
    >
      <div className="prose prose-lg max-w-none">
        {storyContent.split('\n\n').map((paragraph, index) => (
          <p key={index} className={`${
            paragraph.startsWith('> ') 
              ? theme === 'dark' ? 'text-green-400' : 'text-green-600' 
              : ''
          } ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            {paragraph}
          </p>
        ))}
      </div>
      
      <div ref={choicesRef} className="mt-12 mb-24">
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <LoadingIndicator text="故事正在继续..." />
        ) : (
          <>
            <hr className={`my-8 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>你会怎么做？</h2>
            <ChoiceList choices={currentChoices} onChoiceSelected={handleChoiceSelected} />
          </>
        )}
      </div>
      
      {showBackToTop && <BackToTop contentRef={contentRef} />}
    </div>
  );
};

export default NovelReadingScreen;