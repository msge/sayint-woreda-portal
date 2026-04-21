import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { publicApi } from '../../lib/publicApi';

const Home = () => {
  const { language, t } = useLanguage();
  const [news, setNews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await publicApi.get('/news?limit=6&isPublished=true');
        const items = response.data?.data?.news || [];
        setNews(items);
        setAnnouncements(items.filter((item) => item.category === 'announcement').slice(0, 3));
      } catch (error) {
        console.error('Failed to load home content', error);
      }
    };

    load();
  }, []);

  const labels = {
    title: { am: 'አምሐራ ሳይንት ወረዳ የመንግስት ኮሙዩኒኬሽን ጉዳዮች ጽ/ቤት', en: 'Amhara Sayint Woreda Communication Affairs Office' },
    subtitle: { am: 'እንኳን ወደ ኦፊሴላዊ ድህረ ገጻችን በደህና መጡ።', en: 'Welcome to our official digital government portal.' },
    highlights: { am: 'ዋና ዋና ዜናዎች', en: 'News Highlights' },
    announcements: { am: 'ማስታወቂያዎች', en: 'Announcements' },
    searchPlaceholder: { am: 'ዜና ወይም ሰነድ ይፈልጉ...', en: 'Search news or documents...' },
    search: { am: 'ፈልግ', en: 'Search' },
  };

  return (
    <main id="main-content" className="container mx-auto px-4 py-8 space-y-10">
      <section className="bg-white rounded-2xl shadow-md p-6 md:p-10">
        <h1 className="text-2xl md:text-4xl font-bold mb-3">{t(labels.title)}</h1>
        <p className="text-muted-foreground mb-6">{t(labels.subtitle)}</p>

        <form action="/news" className="flex flex-col sm:flex-row gap-3">
          <input
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(labels.searchPlaceholder)}
            className="border rounded-lg px-4 py-2 flex-1"
          />
          <button className="bg-primary text-white rounded-lg px-5 py-2">{t(labels.search)}</button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{t(labels.highlights)}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {news.map((item) => (
            <article key={item.id} className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold mb-2">{language === 'am' ? item.headlineAm : item.headlineEn || item.headlineAm}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {language === 'am' ? item.contentAm : item.contentEn || item.contentAm}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{t(labels.announcements)}</h2>
        <ul className="space-y-3">
          {announcements.map((item) => (
            <li key={item.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              {language === 'am' ? item.headlineAm : item.headlineEn || item.headlineAm}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-3">
        <Link to="/services" className="underline">{language === 'am' ? 'አገልግሎቶች' : 'Services'}</Link>
        <Link to="/documents" className="underline">{language === 'am' ? 'ሰነዶች' : 'Documents'}</Link>
        <Link to="/contact" className="underline">{language === 'am' ? 'ያግኙን' : 'Contact'}</Link>
      </div>
    </main>
  );
};

export default Home;
