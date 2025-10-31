import React, { useState, useEffect } from 'react';
import DistrictSelector from './DistrictSelector';
import MetricsCards from './MetricsCards';
import Charts from './Charts';
import InfoSection from './InfoSection';
import LanguageToggle from './LanguageToggle';
import TimeFilter from './TimeFilter'; // *** NEW IMPORT ***
import { getHistoryByYear, getAvailableFinancialYears } from '../utils/api'; // *** UPDATED IMPORT ***
import { Users, AlertCircle } from 'lucide-react';

// Moved translations object outside the component
const translations = {
  en: {
    title: "MGNREGA Dashboard",
    subtitle: "Chhattisgarh State",
    loading: "Loading data...",
    noData: "Please select a district to view data",
    error: "Failed to load data. Please try again.",
    lastUpdated: "Last Data Entry"
  },
  hi: {
    title: "मनरेगा डैशबोर्ड",
    subtitle: "छत्तीसगढ़ राज्य",
    loading: "डेटा लोड हो रहा है...",
    noData: "कृपया डेटा देखने के लिए एक जिला चुनें",
    error: "डेटा लोड करने में विफल। कृपया पुन: प्रयास करें।",
    lastUpdated: "अंतिम डेटा प्रविष्टि"
  }
};

// *** NEW HELPER FUNCTION ***
// Sums an array of history data to get totals for the MetricsCards
const calculateTotals = (data) => {
  if (!data || data.length === 0) {
    return {
      householdsEmployed: 0,
      personDaysGenerated: 0,
      worksCompleted: 0,
      expenditure: 0,
    };
  }

  return data.reduce((acc, item) => {
    acc.householdsEmployed += item.data.householdsEmployed || 0;
    acc.personDaysGenerated += item.data.personDaysGenerated || 0;
    acc.worksCompleted += item.data.worksCompleted || 0;
    acc.expenditure += item.data.expenditure || 0;
    return acc;
  }, {
    householdsEmployed: 0,
    personDaysGenerated: 0,
    worksCompleted: 0,
    expenditure: 0,
  });
};

const Dashboard = () => {
  const [language, setLanguage] = useState('en');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  // *** STATE MODIFIED ***
  const [historyData, setHistoryData] = useState([]);
  const [totalData, setTotalData] = useState(null); // For MetricsCards
  const [availableYears, setAvailableYears] = useState([]);
  const [timeFilter, setTimeFilter] = useState('12m'); // '12m', 'all', '2020-2021'
  // ---
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = translations[language];

  // Effect to load data when district or time filter changes
  useEffect(() => {
    if (selectedDistrict) {
      loadDistrictData(selectedDistrict, timeFilter);
    }
  }, [selectedDistrict, timeFilter]);

  // Effect to re-calculate totals when history data changes
  useEffect(() => {
    if (historyData.length > 0) {
      const totals = calculateTotals(historyData);
      setTotalData(totals);
    } else {
      setTotalData(null); // Clear totals if no history
    }
  }, [historyData]);

  const loadDistrictData = async (districtCode, yearKey) => {
    setLoading(true);
    setError(null);
    setHistoryData([]); // Clear old data
    
    try {
      // Fetch both history (for charts) and available years (for filter)
      const [historyResponse, yearsResponse] = await Promise.all([
        getHistoryByYear(districtCode, yearKey),
        getAvailableFinancialYears(districtCode) // This will be cached after first run
      ]);

      if (historyResponse.success) {
        setHistoryData(historyResponse.data);
      } else {
        setError(historyResponse.error || t.error);
      }

      if (yearsResponse.success) {
        setAvailableYears(yearsResponse.data);
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

        {/* *** NEW COMPONENT *** */}
        {/* Show time filter only after a district is selected */}
        {selectedDistrict && (
          <TimeFilter
            language={language}
            availableYears={availableYears}
            selectedFilter={timeFilter}
            setSelectedFilter={setTimeFilter}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 text-xl">{t.loading}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && historyData.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-xl">
              {selectedDistrict ? 'No data found for this period.' : t.noData}
            </p>
          </div>
        )}

        {/* Data Display */}
        {/* Note: We check totalData, which is derived from historyData */}
        {!loading && !error && totalData && (
          <>
            <MetricsCards 
              data={totalData} // Pass the calculated totals
              language={language}
            />
            <Charts 
              historyData={historyData} // Pass the monthly history
              language={language}
            />
            
            {/* Last Updated (uses the first item in the sorted history) */}
            <div className="mt-6 text-center text-gray-600">
              <p>
                {t.lastUpdated}:{' '}
                {new Date(historyData[0].lastUpdated).toLocaleDateString(
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