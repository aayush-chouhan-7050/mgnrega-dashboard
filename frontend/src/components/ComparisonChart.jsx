import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ComparisonChart = ({ compareData, selectedDistrictCode, language }) => {
  const t = {
    en: {
      title: 'District vs. State Average (Households Employed)',
      yourDistrict: 'Your District',
      stateAverage: 'State Average',
      value: 'Households'
    },
    hi: {
      title: 'जिला बनाम राज्य औसत (परिवारों को रोजगार)',
      yourDistrict: 'आपका जिला',
      stateAverage: 'राज्य औसत',
      value: 'परिवार'
    }
  }[language];

  // Find the selected district's data
  const selectedDistrict = compareData.find(d => d.districtCode === selectedDistrictCode);

  // Calculate state average from the comparison data
  const validDistricts = compareData.filter(d => d.data && d.data.householdsEmployed > 0);
  const stateAverage = validDistricts.length > 0
    ? validDistricts.reduce((acc, d) => acc + d.data.householdsEmployed, 0) / validDistricts.length
    : 0;

  const data = [
    {
      name: t.yourDistrict,
      [t.value]: selectedDistrict?.data?.householdsEmployed || 0,
    },
    {
      name: t.stateAverage,
      [t.value]: Math.round(stateAverage),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{t.title}</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={language === 'hi' ? 100 : 80} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }}
            formatter={(value) => value.toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN')}
          />
          <Bar dataKey={t.value} fill="#ffc658" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;