import React from 'react';
import { useTranslation } from 'react-i18next';

export const Insights = () => {
  const { t } = useTranslation();
  const title = t('insights.title', { defaultValue: 'Mental Health Insights' });
  const items = t('insights.items', { returnObjects: true, defaultValue: [] }) as any[];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#142C52] text-center mb-16">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <a key={idx} href={item.url} className="block bg-[#FEFAF6] p-6 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-[#142C52]">{item.title}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};