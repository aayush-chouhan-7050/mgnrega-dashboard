import React, { useState, useEffect } from 'react';
import DistrictSelector from './DistrictSelector';
import MetricsCards from './MetricsCards';
import Charts from './Charts';
import InfoSection from './InfoSection';
import LanguageToggle from './LanguageToggle';
import { getDistrictCurrent, getDistrictHistory } from '../utils/api';
import { Users } from 'lucide-react';

const Dashboard = () => {
  const [language, setLanguage] = useState('en');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [currentData, setCurrentData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const translations = {
    en: {
      title: "MGNREGA Dashboard",
      subtitle: "Chhattisgarh State",
      loading: "Loading data...",
      noData: "Please select a district to view data",
      error: "Failed to load data. Please try again."
    },
    hi: {
      title: "मनरेगा डैशबोर्ड",
      subtitle: "छत्तीसगढ़ राज्य",
      loading: "डेटा लोड हो रहा है...",
      noData: "कृपया डेटा देखने के लिए एक जिला चुनें",
      error: "डेटा लोड करने में विफल। कृपया पुन: प्रयास करें।"
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (selectedDistrict) {
      loadDistrictData(selectedDistrict);
    }
  }, [selectedDistrict]);

  const loadDistrictData = async (districtCode) => {
    setLoading(true);
    setError(null);
    
    try {
      const [currentResponse, historyResponse] = await Promise.all([
        getDistrictCurrent(districtCode),
        getDistrictHistory(districtCode)
      ]);

      if (currentResponse.success) {
        setCurrentData(currentResponse.data);
      }

      if (historyResponse.success) {
        setHistoryData(historyResponse.data);
      }
    } catch (err) {
      console.error('Load district data error:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-3 rounded-full">
                <Users className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-800">{t.title}</h1>
                <p className="text-gray-600">{t.subtitle}</p>
              </div>
            </div>
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>
        </div>

        {/* Info Section */}
        <InfoSection language={language} />

        {/* District Selection */}
        <DistrictSelector 
          language={language}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          translations={translations}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 text-xl">{t.loading}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && !currentData && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-xl">{t.noData}</p>
          </div>
        )}

        {/* Data Display */}
        {!loading && !error && currentData && (
          <>
            <MetricsCards 
              data={currentData.data} 
              language={language}
            />
            <Charts 
              historyData={historyData}
              language={language}
            />
            
            {/* Last Updated */}
            <div className="mt-6 text-center text-gray-600">
              <p>
                {language === 'en' ? 'Last Updated: ' : 'अंतिम अपडेट: '}
                {new Date(currentData.lastUpdated).toLocaleDateString(
                  language === 'en' ? 'en-IN' : 'hi-IN'
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;