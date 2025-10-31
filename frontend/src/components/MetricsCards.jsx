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
      format: 'number',
      ariaLabel: {
        en: 'Number of households employed',
        hi: 'रोजगार प्राप्त परिवारों की संख्या'
      }
    },
    {
      icon: Calendar,
      label: {
        en: 'Person Days Generated',
        hi: 'व्यक्ति दिवस उत्पन्न'
      },
      value: data.personDaysGenerated,
      color: 'from-blue-500 to-blue-600',
      format: 'number',
      ariaLabel: {
        en: 'Total person days of employment generated',
        hi: 'उत्पन्न रोजगार के कुल व्यक्ति दिवस'
      }
    },
    {
      icon: Briefcase,
      label: {
        en: 'Works Completed',
        hi: 'कार्य पूर्ण'
      },
      value: data.worksCompleted,
      color: 'from-orange-500 to-orange-600',
      format: 'number',
      ariaLabel: {
        en: 'Number of infrastructure works completed',
        hi: 'पूर्ण किए गए बुनियादी ढांचे के कार्यों की संख्या'
      }
    },
    {
      icon: DollarSign,
      label: {
        en: 'Expenditure (₹ Crores)',
        hi: 'व्यय (₹ करोड़)'
      },
      value: data.expenditure,
      color: 'from-purple-500 to-purple-600',
      format: 'currency',
      ariaLabel: {
        en: 'Total expenditure in rupees crores',
        hi: 'कुल व्यय रुपये करोड़ में'
      }
    }
  ];

  const formatValue = (value, format) => {
    if (format === 'currency') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return value.toLocaleString('en-IN');
  };

  return (
    <section 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      role="region"
      aria-label={language === 'en' ? 'Key Performance Metrics' : 'मुख्य प्रदर्शन मीट्रिक'}
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const formattedValue = formatValue(metric.value, metric.format);
        
        return (
          <article 
            key={index}
            className={`bg-gradient-to-br ${metric.color} rounded-lg shadow-lg p-6 text-white transform transition-transform hover:scale-105 focus-within:scale-105`}
            role="article"
            aria-label={`${metric.ariaLabel[language]}: ${formattedValue}`}
            tabIndex="0"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon size={32} aria-hidden="true" />
              <TrendingUp size={24} aria-hidden="true" />
            </div>
            <h3 className="text-sm opacity-90 mb-1" id={`metric-label-${index}`}>
              {metric.label[language]}
            </h3>
            <p 
              className="text-3xl font-bold"
              aria-labelledby={`metric-label-${index}`}
            >
              {formattedValue}
            </p>
          </article>
        );
      })}
    </section>
  );
};

export default MetricsCards;
