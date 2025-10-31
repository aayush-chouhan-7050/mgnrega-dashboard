import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Loader2 } from 'lucide-react';
import { getDistricts, detectDistrictFromLocation } from '../utils/api';

const DistrictSelector = ({ language, selectedDistrict, setSelectedDistrict, translations }) => {
  const [districts, setDistricts] = useState([]);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState(null);

  const t = {
    en: {
      select: "Select Your District",
      detect: "Use My Location",
      detecting: "Detecting...",
      geoError: "Could not get location. Please select manually.",
      geoUnsupported: "Geolocation is not supported by your browser"
    },
    hi: {
      select: "अपना जिला चुनें",
      detect: "मेरा स्थान उपयोग करें",
      detecting: "पता लगाया जा रहा है...",
      geoError: "स्थान नहीं मिल सका। कृपया मैन्युअल रूप से चुनें।",
      geoUnsupported: "आपका ब्राउज़र जियोलोकेशन का समर्थन नहीं करता"
    }
  }[language];

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      setError(null);
      const response = await getDistricts();
      if (response.success) {
        // Sort districts alphabetically by the selected language name
        const sortedDistricts = response.districts.sort((a, b) => {
          return a.name[language].localeCompare(b.name[language], language === 'hi' ? 'hi' : 'en');
        });
        setDistricts(sortedDistricts);
      }
    } catch (error) {
      console.error('Load districts error:', error);
      setError('Failed to load districts list.');
    }
  };

  // Re-sort districts if language changes
  useEffect(() => {
    if (districts.length > 0) {
      setDistricts(prevDistricts => {
        return [...prevDistricts].sort((a, b) => {
          return a.name[language].localeCompare(b.name[language], language === 'hi' ? 'hi' : 'en');
        });
      });
    }
  }, [language]);


  const handleDetectLocation = () => {
    setDetectingLocation(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const result = await detectDistrictFromLocation(latitude, longitude);
            
            if (result.success && result.detectedDistrict) {
              // Check if the detected district is in our list
              if (districts.some(d => d.code === result.detectedDistrict)) {
                setSelectedDistrict(result.detectedDistrict);
              } else {
                setError(t.geoError); // Or "District not in list"
              }
            } else {
              setError(t.geoError);
            }
          } catch (error) {
            console.error('Location detection error:', error);
            setError(t.geoError);
          } finally {
            setDetectingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError(t.geoError);
          setDetectingLocation(false);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      setError(t.geoUnsupported);
      setDetectingLocation(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <label htmlFor="district-select" className="flex items-center gap-2 font-semibold text-gray-700 sr-only">
          <MapPin className="text-green-600 flex-shrink-0" size={24} />
          {t.select}
        </label>
        <select
          id="district-select"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          // Added w-full for consistent mobile stacking
          className="w-full sm:flex-1 p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
        >
          <option value="">
            {t.select}
          </option>
          {districts.map(d => (
            <option key={d.code} value={d.code}>
              {d.name?.[language]} ({d.name?.en})
            </option>
          ))}
        </select>
        <button
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          // Added w-full for consistent mobile stacking
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {detectingLocation ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Globe size={20} />
          )}
          {detectingLocation ? t.detecting : t.detect}
        </button>
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-3 text-center sm:text-left">{error}</p>
      )}
    </div>
  );
};

export default DistrictSelector;