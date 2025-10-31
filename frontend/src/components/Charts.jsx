import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Charts = ({ historyData, language }) => {
  const translations = {
    en: {
      monthlyTrend: 'Monthly Trend - Households',
      personDays: 'Person Days Generated',
      households: 'Households',
      expenditure: 'Expenditure Trend'
    },
    hi: {
      monthlyTrend: 'मासिक रुझान - परिवार',
      personDays: 'व्यक्ति दिवस उत्पन्न',
      households: 'परिवार',
      expenditure: 'व्यय रुझान'
    }
  };

  const t = translations[language];

  // Prepare chart data
  const chartData = historyData
    .slice()
    .reverse()
    .map(item => ({
      month: item.month,
      households: item.data.householdsEmployed,
      personDays: item.data.personDaysGenerated,
      expenditure: item.data.expenditure
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Line Chart - Households Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.monthlyTrend}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="households" 
              stroke="#4CAF50" 
              strokeWidth={3} 
              name={t.households}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Person Days */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.personDays}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="personDays" 
              fill="#2196F3" 
              name={t.personDays}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expenditure Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t.expenditure}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="expenditure" 
              stroke="#9C27B0" 
              strokeWidth={3} 
              name={language === 'en' ? 'Expenditure (₹ Crores)' : 'व्यय (₹ करोड़)'}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;