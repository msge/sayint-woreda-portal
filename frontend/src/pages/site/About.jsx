import React from 'react';
import PageHero from '../../components/site/PageHero';
import { useLanguage } from '../../contexts/LanguageContext';

const About = () => {
  const { language } = useLanguage();

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <PageHero
        title={language === 'am' ? 'ስለ እኛ' : 'About Us'}
        subtitle={language === 'am' ? 'የሳይንት ወረዳ ኮሙዩኒኬሽን ቢሮ ተልዕኮ፣ ራዕይ እና ተግባራት።' : 'Mission, vision, and institutional responsibilities of the office.'}
      />

      <section className="grid lg:grid-cols-3 gap-4">
        <article className="bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-2">{language === 'am' ? 'ተልዕኮ' : 'Mission'}</h2>
          <p className="text-muted-foreground">{language === 'am' ? 'ህዝብን በትክክል እና በፍጥነት መረጃ ማድረስ እና መንግስት-ህዝብ ግንኙነትን ማጠናከር።' : 'Deliver timely, credible public information and strengthen government–community communication.'}</p>
        </article>
        <article className="bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-2">{language === 'am' ? 'ራዕይ' : 'Vision'}</h2>
          <p className="text-muted-foreground">{language === 'am' ? 'ግልጽ እና የተደራጀ መንግስታዊ ኮሙኒኬሽን በወረዳው ሁሉም ክፍሎች ማስፋፋት።' : 'A transparent and inclusive communication ecosystem across woreda institutions.'}</p>
        </article>
        <article className="bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-semibold mb-2">{language === 'am' ? 'እሴቶች' : 'Core Values'}</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>{language === 'am' ? 'ግልጽነት' : 'Transparency'}</li>
            <li>{language === 'am' ? 'ተጠያቂነት' : 'Accountability'}</li>
            <li>{language === 'am' ? 'ህዝብ ተሳትፎ' : 'Public participation'}</li>
          </ul>
        </article>
      </section>
    </main>
  );
};

export default About;
