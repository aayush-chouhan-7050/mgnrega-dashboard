import React from 'react';
import { Info } from 'lucide-react';

const InfoSection = ({ language }) => {
  const content = {
    en: {
      title: 'What is MGNREGA?',
      text: 'MGNREGA guarantees 100 days of wage employment to rural households. It helps build village infrastructure and provides livelihood security. Over 12.15 Crore rural Indians benefitted in 2025.'
    },
    hi: {
      title: 'मनरेगा क्या है?',
      text: 'मनरेगा ग्रामीण परिवारों को 100 दिनों के मजदूरी रोजगार की गारंटी देता है। यह गांव के बुनियादी ढांचे का निर्माण करता है और आजीविका सुरक्षा प्रदान करता है। 2025 में 12.15 करोड़ से अधिक ग्रामीण भारतीयों को लाभ हुआ।'
    }
  };

  const t = content[language];

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
      <div className="flex items-start gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">{t.title}</h3>
          <p className="text-blue-800 text-sm leading-relaxed">{t.text}</p>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;