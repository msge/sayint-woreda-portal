import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { publicApi } from '../../lib/publicApi';
import PageHero from '../../components/site/PageHero';

const News = () => {
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    setQuery(params.get('search') || '');
  }, [params]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await publicApi.get('/news', {
          params: { isPublished: true, search: query || undefined, limit: 30 },
        });
        setItems(response.data?.data?.news || []);
      } catch (error) {
        console.error('Failed to load news', error);
      }
    };
    load();
  }, [query]);

  const filtered = useMemo(() => items, [items]);

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <PageHero
        title={language === 'am' ? 'ዜና እና ማስታወቂያዎች' : 'News & Announcements'}
        subtitle={language === 'am' ? 'በሳይንት ወረዳ የሚወጡ የቅርብ ጊዜ መረጃዎች እና ይፋዊ መግለጫዎች።' : 'Latest updates and official public communications from the woreda office.'}
        actions={
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setParams(query ? { search: query } : {});
            }}
          >
            <input className="border rounded-md px-3 py-2 min-w-56" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={language === 'am' ? 'ፈልግ' : 'Search'} />
            <button className="bg-primary text-white px-4 rounded-md">{language === 'am' ? 'ፈልግ' : 'Search'}</button>
          </form>
        }
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <article key={item.id} className="border rounded-xl bg-white p-5 hover:shadow-sm transition">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase">{item.category}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.isPublished ? (language === 'am' ? 'ታትሟል' : 'Published') : (language === 'am' ? 'ረቂቅ' : 'Draft')}</span>
            </div>
            <h2 className="font-semibold text-xl mb-2 line-clamp-2">{language === 'am' ? item.headlineAm : item.headlineEn || item.headlineAm}</h2>
            <p className="text-sm text-muted-foreground line-clamp-4">{language === 'am' ? item.contentAm : item.contentEn || item.contentAm}</p>
          </article>
        ))}
      </div>
    </main>
  );
};

export default News;
