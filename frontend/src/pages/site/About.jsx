import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const About = () => {
  const { language } = useLanguage();

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">{language === 'am' ? 'ስለ እኛ' : 'About Us'}</h1>
      <section className="bg-white p-6 rounded-xl border">
        <h2 className="text-xl font-semibold mb-2">{language === 'am' ? 'ተልዕኮ' : 'Mission'}</h2>
        <p>{language === 'am' ? 'ህዝብን በትክክል እና በፍጥነት መረጃ ማድረስ እና መንግስት-ህዝብ ግንኙነትን ማጠናከር።' : 'Deliver timely, credible public information and strengthen government–community communication.'}</p>
      </section>
      <section className="bg-white p-6 rounded-xl border">
        <h2 className="text-xl font-semibold mb-2">{language === 'am' ? 'ራዕይ' : 'Vision'}</h2>
        <p>{language === 'am' ? 'ግልጽ እና የተደራጀ መንግስታዊ ኮሙኒኬሽን በወረዳው ሁሉም ክፍሎች ማስፋፋት።' : 'A transparent and inclusive communication ecosystem across all woreda institutions.'}</p>
      </section>
      <section className="bg-white p-6 rounded-xl border">
        <h2 className="text-xl font-semibold mb-2">{language === 'am' ? 'ኃላፊነቶች' : 'Responsibilities'}</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>{language === 'am' ? 'የህዝብ ማስታወቂያ እና የዜና አስተዳደር' : 'Public announcements and news communication'}</li>
          <li>{language === 'am' ? 'የመረጃ ማቅረብ እና የሚዲያ ግንኙነት' : 'Information dissemination and media relations'}</li>
          <li>{language === 'am' ? 'የማህበረሰብ እና ባለድርሻ አካላት ግንኙነት' : 'Community and stakeholder engagement'}</li>
        </ul>
      </section>
    </main>
  );
};

export default About;
