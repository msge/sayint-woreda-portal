import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const Services = () => {
  const { language } = useLanguage();
  const services = [
    {
      am: 'የመንግስት ማስታወቂያ ህትመት',
      en: 'Government announcement publishing',
    },
    {
      am: 'የዜና ሽፋን እና የሚዲያ አገናኝ',
      en: 'News coverage and media liaison',
    },
    {
      am: 'የሰነድ ማስተዳደር እና ማቅረብ',
      en: 'Document management and publication',
    },
    {
      am: 'የማህበረሰብ ግንኙነት እና ፎረም አስተባባሪ',
      en: 'Community communication and forum facilitation',
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{language === 'am' ? 'አገልግሎቶች' : 'Services'}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {services.map((service) => (
          <article key={service.en} className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-lg">{language === 'am' ? service.am : service.en}</h2>
          </article>
        ))}
      </div>
    </main>
  );
};

export default Services;
