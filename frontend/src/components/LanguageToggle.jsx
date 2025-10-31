import React from 'react';

const LanguageToggle = ({ language, setLanguage }) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => setLanguage('en')}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          language === 'en' 
            ? 'bg-green-600 text-white shadow-md' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          language === 'hi' 
            ? 'bg-green-600 text-white shadow-md' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
};

export default LanguageToggle;