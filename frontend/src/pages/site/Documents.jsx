import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { publicApi } from '../../lib/publicApi';

const Documents = () => {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await publicApi.get('/documents/public', {
          params: {
            search: search || undefined,
            limit: 50,
          },
        });
        setDocuments(response.data?.data?.documents || []);
      } catch (error) {
        console.error('Failed to load documents', error);
      }
    };

    load();
  }, [search]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">{language === 'am' ? 'ሰነዶች እና ዳውንሎዶች' : 'Documents & Downloads'}</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'am' ? 'ሰነድ ፈልግ' : 'Search documents'}
          className="border rounded-md px-3 py-2"
        />
      </div>

      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="p-3">{language === 'am' ? 'ርዕስ' : 'Title'}</th>
              <th className="p-3">{language === 'am' ? 'ምድብ' : 'Category'}</th>
              <th className="p-3">{language === 'am' ? 'ፋይል' : 'File'}</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="p-3">{language === 'am' ? doc.titleAm : doc.titleEn || doc.titleAm}</td>
                <td className="p-3">{doc.category}</td>
                <td className="p-3">
                  <a href={`${publicApi.defaults.baseURL.replace('/api', '')}${doc.filePath}`} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                    {language === 'am' ? 'አውርድ' : 'Download'}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Documents;
