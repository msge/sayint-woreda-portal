import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const mediaItems = [
  { title: 'Community Communication Forum', type: 'image', src: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80' },
  { title: 'Government Service Briefing', type: 'image', src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80' },
  { title: 'Public Announcement Session', type: 'image', src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80' },
];

const MediaGallery = () => {
  const { language } = useLanguage();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{language === 'am' ? 'ሚዲያ ጋለሪ' : 'Media Gallery'}</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {mediaItems.map((item) => (
          <figure key={item.title} className="border rounded-xl overflow-hidden bg-white">
            <img src={item.src} alt={item.title} className="w-full h-48 object-cover" loading="lazy" />
            <figcaption className="p-3 text-sm">{item.title}</figcaption>
          </figure>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">{language === 'am' ? 'ቪዲዮ' : 'Video'}</h2>
        <div className="aspect-video rounded-xl overflow-hidden border bg-black/5">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Office Media Video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
};

export default MediaGallery;
