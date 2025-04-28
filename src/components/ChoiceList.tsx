import React from 'react';
import { StoryChoice } from '../types';
import { useThemeStore } from './ThemeSwitcher';

interface ChoiceListProps {
  choices: StoryChoice[];
  onChoiceSelected: (choice: StoryChoice) => void;
}

const ChoiceList: React.FC<ChoiceListProps> = ({ choices, onChoiceSelected }) => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className="space-y-4">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onChoiceSelected(choice)}
          className={`w-full text-left p-4 rounded-lg transition-colors duration-200 border ${
            theme === 'dark'
              ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-gray-500 text-gray-200'
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 text-gray-800'
          }`}
        >
          <div className="flex items-start">
            <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>•</span>
            <span className="ml-2">{choice.text}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChoiceList;