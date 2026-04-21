import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { publicApi } from '../../lib/publicApi';

const Contact = () => {
  const { language } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await publicApi.post('/contact', form);
      setStatus(language === 'am' ? 'መልእክትዎ ተልኳል።' : 'Your message has been sent.');
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus(language === 'am' ? 'ስህተት ተፈጥሯል።' : 'Something went wrong.');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6">
      <section className="bg-white border rounded-xl p-6 space-y-3">
        <h1 className="text-3xl font-bold">{language === 'am' ? 'ግንኙነት' : 'Contact Us'}</h1>
        <p>+251 58 111 2222</p>
        <p>info@sayintworeda.gov.et</p>
        <p>{language === 'am' ? 'ሳይንት ወረዳ፣ ደቡብ ወሎ፣ አማራ ክልል' : 'Sayint Woreda, South Wollo, Amhara Region'}</p>
        <iframe
          title="Office Location"
          className="w-full h-64 rounded-lg border"
          src="https://maps.google.com/maps?q=Sayint%20Woreda&t=&z=12&ie=UTF8&iwloc=&output=embed"
          loading="lazy"
        />
      </section>

      <section className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">{language === 'am' ? 'መልእክት ይላኩ' : 'Send Message'}</h2>
        <form className="space-y-3" onSubmit={submit}>
          <input required className="border rounded-md px-3 py-2 w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={language === 'am' ? 'ስም' : 'Name'} />
          <input required type="email" className="border rounded-md px-3 py-2 w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={language === 'am' ? 'ኢሜይል' : 'Email'} />
          <textarea required className="border rounded-md px-3 py-2 w-full min-h-32" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={language === 'am' ? 'መልእክት' : 'Message'} />
          <button className="bg-primary text-white px-4 py-2 rounded-md">{language === 'am' ? 'ላክ' : 'Submit'}</button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </form>
      </section>
    </main>
  );
};

export default Contact;
