import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { publicApi } from '../../lib/publicApi';

const News = () => {
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    const q = params.get('search') || '';
    setQuery(q);
  }, [params]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await publicApi.get('/news', {
          params: {
            isPublished: true,
            search: query || undefined,
            limit: 30,
          },
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
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">{language === 'am' ? 'ዜና እና ማስታወቂያዎች' : 'News & Announcements'}</h1>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setParams(query ? { search: query } : {});
          }}
        >
          <input className="border rounded-md px-3 py-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={language === 'am' ? 'ፈልግ' : 'Search'} />
          <button className="bg-primary text-white px-4 rounded-md">{language === 'am' ? 'ፈልግ' : 'Search'}</button>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <article key={item.id} className="border rounded-xl bg-white p-5">
            <p className="text-xs text-muted-foreground mb-2 uppercase">{item.category}</p>
            <h2 className="font-semibold text-xl mb-2">{language === 'am' ? item.headlineAm : item.headlineEn || item.headlineAm}</h2>
            <p className="text-sm text-muted-foreground">{language === 'am' ? item.contentAm : item.contentEn || item.contentAm}</p>
          </article>
        ))}
      </div>
    </main>
  );
};

export default News;
