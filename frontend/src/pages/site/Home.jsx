import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Newspaper, FileText, Phone } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { publicApi } from '../../lib/publicApi';
import PageHero from '../../components/site/PageHero';

const Home = () => {
  const { language, t } = useLanguage();
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await publicApi.get('/news?limit=8&isPublished=true');
        setNews(response.data?.data?.news || []);
      } catch (error) {
        console.error('Failed to load home content', error);
      }
    };

    load();
  }, []);

  const announcements = useMemo(
    () => news.filter((item) => item.category === 'announcement').slice(0, 4),
    [news]
  );

  const labels = {
    title: { am: 'አምሐራ ሳይንት ወረዳ የመንግስት ኮሙዩኒኬሽን ጉዳዮች ጽ/ቤት', en: 'Amhara Sayint Woreda Communication Affairs Office' },
    subtitle: { am: 'ዘመናዊ፣ ግልፅ እና የሚደረስበት የመንግስት መረጃ እና አገልግሎት መድረክ።', en: 'A modern, transparent and accessible digital government information portal.' },
    highlights: { am: 'ዋና ዋና ዜናዎች', en: 'News Highlights' },
    announcements: { am: 'አስፈላጊ ማስታወቂያዎች', en: 'Important Announcements' },
    searchPlaceholder: { am: 'ዜና ወይም ሰነድ ይፈልጉ...', en: 'Search news or documents...' },
    search: { am: 'ፈልግ', en: 'Search' },
  };

  const quick = [
    { to: '/news', icon: Newspaper, label: { am: 'ዜና እና ማስታወቂያ', en: 'News & Announcements' } },
    { to: '/documents', icon: FileText, label: { am: 'ሰነዶች እና ዳውንሎድ', en: 'Documents & Downloads' } },
    { to: '/services', icon: Megaphone, label: { am: 'አገልግሎቶች', en: 'Services' } },
    { to: '/contact', icon: Phone, label: { am: 'ግንኙነት', en: 'Contact' } },
  ];

  return (
    <main id="main-content" className="container mx-auto px-4 py-8 space-y-8">
      <PageHero
        title={t(labels.title)}
        subtitle={t(labels.subtitle)}
        actions={
          <form action="/news" className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(labels.searchPlaceholder)}
              className="border rounded-lg px-4 py-2 min-w-60"
            />
            <button className="bg-primary text-white rounded-lg px-5 py-2 font-medium">{t(labels.search)}</button>
          </form>
        }
      />

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quick.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="rounded-xl border bg-white p-4 hover:border-primary/40 hover:shadow-sm transition">
            <Icon className="h-5 w-5 mb-2 text-primary" />
            <span className="font-medium">{t(label)}</span>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{t(labels.highlights)}</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {news.slice(0, 8).map((item) => (
            <article key={item.id} className="bg-white border rounded-xl p-4 hover:shadow-sm transition">
              <p className="text-xs uppercase text-primary mb-2">{item.category}</p>
              <h3 className="font-semibold mb-2 line-clamp-2">{language === 'am' ? item.headlineAm : item.headlineEn || item.headlineAm}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{language === 'am' ? item.contentAm : item.contentEn || item.contentAm}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">{t(labels.announcements)}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {announcements.map((item) => (
            <div key={item.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-medium">{language === 'am' ? item.headlineAm : item.headlineEn || item.headlineAm}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
