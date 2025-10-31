import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

const ScreenReaderButton = ({ language }) => {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports speech synthesis
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speakText = (text) => {
    if (!isSupported) {
      alert(language === 'en' 
        ? 'Text-to-speech is not supported in your browser' 
        : 'आपके ब्राउज़र में टेक्स्ट-टू-स्पीच समर्थित नहीं है');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsReading(true);
    setIsPaused(false);
  };

  const readPageContent = () => {
    // Get all readable content from the page
    const content = [];
    
    // Title
    const title = document.querySelector('h1');
    if (title) content.push(title.textContent);

    // Info section
    const infoText = document.querySelector('.bg-blue-50 p');
    if (infoText) content.push(infoText.textContent);

    // Selected district
    const districtSelect = document.querySelector('select');
    if (districtSelect && districtSelect.value) {
      const selectedOption = districtSelect.options[districtSelect.selectedIndex];
      content.push(
        language === 'en' 
          ? `Selected district: ${selectedOption.text}` 
          : `चयनित जिला: ${selectedOption.text}`
      );
    }

    // Metrics cards
    const metrics = document.querySelectorAll('.bg-gradient-to-br');
    metrics.forEach(card => {
      const label = card.querySelector('h3');
      const value = card.querySelector('.text-3xl');
      if (label && value) {
        content.push(`${label.textContent}: ${value.textContent}`);
      }
    });

    const fullText = content.join('. ');
    speakText(fullText);
  };

  const togglePause = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {/* Main read button */}
      <button
        onClick={readPageContent}
        disabled={isReading}
        className={`
          flex items-center gap-2 px-4 py-3 rounded-full shadow-lg
          transition-all transform hover:scale-105
          ${isReading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
          text-white font-medium
        `}
        aria-label={language === 'en' ? 'Read page content aloud' : 'पृष्ठ सामग्री पढ़ें'}
      >
        <Volume2 size={24} />
        <span className="hidden sm:inline">
          {language === 'en' ? 'Read Aloud' : 'सुनें'}
        </span>
      </button>

      {/* Control buttons (show only when reading) */}
      {isReading && (
        <div className="flex gap-2">
          <button
            onClick={togglePause}
            className="flex items-center justify-center w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-all"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
          <button
            onClick={stopReading}
            className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all"
            aria-label="Stop"
          >
            <VolumeX size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ScreenReaderButton;