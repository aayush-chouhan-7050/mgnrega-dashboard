import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Loader } from 'lucide-react';
import { getDistricts, detectDistrictFromLocation } from '../utils/api';

const DistrictSelector = ({ language, selectedDistrict, setSelectedDistrict, translations }) => {
  const [districts, setDistricts] = useState([]);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const t = translations[language];

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      const response = await getDistricts();
      if (response.success) {
        setDistricts(response.districts);
      }
    } catch (error) {
      console.error('Load districts error:', error);
    }
  };

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const result = await detectDistrictFromLocation(latitude, longitude);
            
            if (result.success && result.detectedDistrict) {
              setSelectedDistrict(result.detectedDistrict);
            }
          } catch (error) {
            console.error('Location detection error:', error);
          } finally {
            setDetectingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setDetectingLocation(false);
        }
      );
    } else {
      alert(language === 'en' 
        ? 'Geolocation is not supported by your browser' 
        : 'आपका ब्राउज़र जियोलोकेशन का समर्थन नहीं करता');
      setDetectingLocation(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <MapPin className="text-green-600 flex-shrink-0" size={24} />
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="flex-1 p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-green-500 focus:outline-none"
        >
          <option value="">
            {language === 'en' ? 'Select Your District' : 'अपना जिला चुनें'}
          </option>
          {districts.map(d => (
            <option key={d.code} value={d.code}>
              {d.name?.[language]}
            </option>
          ))}
        </select>
        <button
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {detectingLocation ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <Globe size={20} />
          )}
          {language === 'en' ? 'Use My Location' : 'मेरा स्थान उपयोग करें'}
        </button>
      </div>
    </div>
  );
};

export default DistrictSelector;