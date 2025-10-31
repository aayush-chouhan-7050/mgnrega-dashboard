import React from 'react';
import { Users, Calendar, Briefcase, DollarSign, TrendingUp } from 'lucide-react';

const MetricsCards = ({ data, language }) => {
  const metrics = [
    {
      icon: Users,
      label: {
        en: 'Households Employed',
        hi: 'परिवारों को रोजगार'
      },
      value: data.householdsEmployed,
      color: 'from-green-500 to-green-600',
      format: 'number'
    },
    {
      icon: Calendar,
      label: {
        en: 'Person Days Generated',
        hi: 'व्यक्ति दिवस उत्पन्न'
      },
      value: data.personDaysGenerated,
      color: 'from-blue-500 to-blue-600',
      format: 'number'
    },
    {
      icon: Briefcase,
      label: {
        en: 'Works Completed',
        hi: 'कार्य पूर्ण'
      },
      value: data.worksCompleted,
      color: 'from-orange-500 to-orange-600',
      format: 'number'
    },
    {
      icon: DollarSign,
      label: {
        en: 'Expenditure (₹ Crores)',
        hi: 'व्यय (₹ करोड़)'
      },
      value: data.expenditure,
      color: 'from-purple-500 to-purple-600',
      format: 'currency'
    }
  ];

  const formatValue = (value, format) => {
    if (format === 'currency') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return value.toLocaleString('en-IN');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div 
            key={index}
            className={`bg-gradient-to-br ${metric.color} rounded-lg shadow-lg p-6 text-white transform transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon size={32} />
              <TrendingUp size={24} />
            </div>
            <h3 className="text-sm opacity-90 mb-1">{metric.label[language]}</h3>
            <p className="text-3xl font-bold">
              {formatValue(metric.value, metric.format)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
