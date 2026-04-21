import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import PageHero from '../../components/site/PageHero';

const Services = () => {
  const { language } = useLanguage();
  const services = [
    { am: 'የመንግስት ማስታወቂያ ህትመት', en: 'Government announcement publishing' },
    { am: 'የዜና ሽፋን እና የሚዲያ አገናኝ', en: 'News coverage and media liaison' },
    { am: 'የሰነድ ማስተዳደር እና ማቅረብ', en: 'Document management and publication' },
    { am: 'የማህበረሰብ ግንኙነት ፎረም አስተባባሪ', en: 'Community communication forum facilitation' },
    { am: 'የዲጂታል መረጃ ስርጭት', en: 'Digital public information dissemination' },
    { am: 'የህዝብ የግንኙነት አገልግሎት', en: 'Public relations support service' },
  ];

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <PageHero
        title={language === 'am' ? 'አገልግሎቶች' : 'Services'}
        subtitle={language === 'am' ? 'ቢሮው ለህዝብ እና ለባለድርሻ አካላት የሚያቀርባቸው የኮሙኒኬሽን አገልግሎቶች።' : 'Government communication services provided for citizens and stakeholders.'}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <article key={service.en} className="bg-white border rounded-xl p-5 hover:border-primary/40 transition">
            <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
            <h2 className="font-semibold text-lg">{language === 'am' ? service.am : service.en}</h2>
          </article>
        ))}
      </div>
    </main>
  );
};

export default Services;
