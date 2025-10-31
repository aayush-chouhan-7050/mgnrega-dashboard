import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// *** NEW HELPER FUNCTION ***
const getChartSummary = (data, key, language, isCurrency = false) => {
  if (!data || data.length === 0) return '';

  const t = {
    en: {
      highest: 'Highest was',
      lowest: 'Lowest was',
      in: 'in',
    },
    hi: {
      highest: 'उच्चतम था',
      lowest: 'न्यूनतम था',
      in: 'में',
    }
  }[language];

  const sorted = [...data].sort((a, b) => a[key] - b[key]);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  const formatValue = (val) => {
    let num = Number(val) || 0;
    if (isCurrency) {
      return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }
    return num.toLocaleString('en-IN');
  };

  if (!min || !max) return '';

  return `${t.highest} ${formatValue(max[key])} ${t.in} ${max.month}. ${t.lowest} ${formatValue(min[key])} ${t.in} ${min.month}.`;
};

// ---

const Charts = ({ historyData, language }) => {
  const translations = {
    en: {
      monthlyTrend: 'Monthly Trend - Households',
      personDays: 'Person Days Generated',
      households: 'Households',
      expenditure: 'Expenditure Trend (₹ Crores)',
      expenditureLabel: 'Expenditure (₹ Crores)'
    },
    hi: {
      monthlyTrend: 'मासिक रुझान - परिवार',
      personDays: 'व्यक्ति दिवस उत्पन्न',
      households: 'परिवार',
      expenditure: 'व्यय रुझान (₹ करोड़)',
      expenditureLabel: 'व्यय (₹ करोड़)'
    }
  };

  const t = translations[language];

  // Prepare chart data
  const chartData = historyData
    .slice()
    .reverse() // Sorts from oldest to newest for the chart
    .map(item => ({
      // Use abbreviated month + year for clarity if data spans years
      month: `${item.month.substring(0, 3)}-${item.year.toString().slice(-2)}`, 
      households: item.data.householdsEmployed,
      personDays: item.data.personDaysGenerated,
      expenditure: parseFloat(item.data.expenditure.toFixed(2))
    }));

  // *** GENERATE SUMMARIES ***
  const householdSummary = getChartSummary(chartData, 'households', language);
  const personDaySummary = getChartSummary(chartData, 'personDays', language);
  const expenditureSummary = getChartSummary(chartData, 'expenditure', language, true);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Line Chart - Households Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2" id="households-chart-title">{t.monthlyTrend}</h2>
        {/* *** NEW SUMMARY TEXT *** */}
        <p className="text-sm text-gray-600 mb-4 italic" id="households-chart-desc">
          {householdSummary}
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={chartData} 
            aria-labelledby="households-chart-title households-chart-desc"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN')} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="households" 
              stroke="#4CAF50" 
              strokeWidth={3} 
              name={t.households}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Person Days */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2" id="persondays-chart-title">{t.personDays}</h2>
         {/* *** NEW SUMMARY TEXT *** */}
         <p className="text-sm text-gray-600 mb-4 italic" id="persondays-chart-desc">
          {personDaySummary}
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData}
            aria-labelledby="persondays-chart-title persondays-chart-desc"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => value.toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN')} />
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
        <h2 className="text-xl font-bold text-gray-800 mb-2" id="expenditure-chart-title">{t.expenditure}</h2>
        {/* *** NEW SUMMARY TEXT *** */}
        <p className="text-sm text-gray-600 mb-4 italic" id="expenditure-chart-desc">
          {expenditureSummary}
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={chartData}
            aria-labelledby="expenditure-chart-title expenditure-chart-desc"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN')}`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="expenditure" 
              stroke="#9C27B0" 
              strokeWidth={3} 
              name={t.expenditureLabel}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;