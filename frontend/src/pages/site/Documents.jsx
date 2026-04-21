import React, { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { publicApi } from '../../lib/publicApi';
import PageHero from '../../components/site/PageHero';

const Documents = () => {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await publicApi.get('/documents/public', {
          params: { search: search || undefined, limit: 50 },
        });
        setDocuments(response.data?.data?.documents || []);
      } catch (error) {
        console.error('Failed to load documents', error);
      }
    };

    load();
  }, [search]);

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <PageHero
        title={language === 'am' ? 'ሰነዶች እና ዳውንሎዶች' : 'Documents & Downloads'}
        subtitle={language === 'am' ? 'ኦፊሴላዊ ሪፖርቶች፣ ፖሊሲዎች እና ቅጾች ከዚህ ገጽ ያግኙ።' : 'Access official reports, policies, and templates in one place.'}
        actions={<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={language === 'am' ? 'ሰነድ ፈልግ' : 'Search documents'} className="border rounded-md px-3 py-2" />}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <article key={doc.id} className="rounded-xl border bg-white p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold line-clamp-2">{language === 'am' ? doc.titleAm : doc.titleEn || doc.titleAm}</h2>
                <p className="text-xs text-muted-foreground uppercase mt-1">{doc.category}</p>
              </div>
            </div>

            <a href={`${publicApi.defaults.baseURL.replace('/api', '')}${doc.filePath}`} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
              <Download className="h-4 w-4" />
              {language === 'am' ? 'አውርድ' : 'Download'}
            </a>
          </article>
        ))}
      </div>
    </main>
  );
};

export default Documents;
