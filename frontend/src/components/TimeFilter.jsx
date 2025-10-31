import React from 'react';
import { Calendar } from 'lucide-react';

const TimeFilter = ({ availableYears, selectedFilter, setSelectedFilter, language }) => {
  const t = {
    en: {
      selectPeriod: 'Select Time Period',
      last12: 'Last 12 Months',
      allTime: 'All Time',
      finYear: 'Financial Year'
    },
    hi: {
      selectPeriod: 'समय अवधि चुनें',
      last12: 'पिछले 12 महीने',
      allTime: 'कुल समय',
      finYear: 'वित्तीय वर्ष'
    }
  }[language];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <label htmlFor="time-filter" className="flex items-center gap-2 font-semibold text-gray-700">
          <Calendar className="text-blue-600" size={20} />
          {t.selectPeriod}
        </label>
        <select
          id="time-filter"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="flex-1 p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="12m">{t.last12}</option>
          <option value="all">{t.allTime}</option>
          <optgroup label={t.finYear}>
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
    </div>
  );
};

export default TimeFilter;