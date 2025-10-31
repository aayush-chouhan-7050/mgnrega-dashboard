import React from 'react';

const LanguageToggle = ({ language, setLanguage }) => {
  return (
    // Stacks vertically on mobile, horizontally on sm screens and up
    // Buttons take full width on mobile for easier tapping
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <button
        onClick={() => setLanguage('en')}
        className={`px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto ${
          language === 'en' 
            ? 'bg-green-600 text-white shadow-md' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-pressed={language === 'en'}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto ${
          language === 'hi' 
            ? 'bg-green-600 text-white shadow-md' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-pressed={language === 'hi'}
      >
        हिंदी
      </button>
    </div>
  );
};

export default LanguageToggle;