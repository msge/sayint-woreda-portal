import React from 'react';
import PageHero from '../../components/site/PageHero';
import { useLanguage } from '../../contexts/LanguageContext';

const mediaItems = [
  { title: 'Community Communication Forum', src: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80' },
  { title: 'Government Service Briefing', src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80' },
  { title: 'Public Announcement Session', src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80' },
  { title: 'Youth Engagement Event', src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80' },
  { title: 'Planning Workshop', src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80' },
  { title: 'Field Information Session', src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80' },
];

const MediaGallery = () => {
  const { language } = useLanguage();

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <PageHero
        title={language === 'am' ? 'ሚዲያ ጋለሪ' : 'Media Gallery'}
        subtitle={language === 'am' ? 'የቢሮው ክስተቶች፣ የመስክ ስራዎች እና ይፋዊ ፕሮግራሞች ፎቶ እና ቪዲዮ ማህደር።' : 'Photo and video highlights from office activities and public events.'}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mediaItems.map((item) => (
          <figure key={item.title} className="border rounded-xl overflow-hidden bg-white hover:shadow-sm transition">
            <img src={item.src} alt={item.title} className="w-full h-52 object-cover" loading="lazy" />
            <figcaption className="p-3 text-sm font-medium">{item.title}</figcaption>
          </figure>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">{language === 'am' ? 'ኦፊሴላዊ ቪዲዮ' : 'Official Video'}</h2>
        <div className="aspect-video rounded-xl overflow-hidden border bg-black/5">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/jfKfPfyJRdk"
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
