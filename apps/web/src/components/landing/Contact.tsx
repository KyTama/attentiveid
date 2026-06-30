import React from 'react';
import { useTranslation } from 'react-i18next';

export const Contact = () => {
  const { t } = useTranslation();
  const title = t('locations.title', { defaultValue: 'Our Clinics' });
  const items = t('locations.items', { returnObjects: true, defaultValue: [] }) as any[];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#142C52] text-center mb-16">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((loc, idx) => (
            <div key={idx} className="border border-slate-200 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{loc.name}</h3>
              <p className="text-slate-600 mb-4">{loc.address}</p>
              <a href="#" className="text-primary font-medium hover:underline">
                {t('contact.viewOnMaps', { defaultValue: 'View on Maps' })}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};