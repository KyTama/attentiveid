import React from 'react';
import { useTranslation } from 'react-i18next';

export const WhyUs = () => {
  const { t } = useTranslation();
  const title = t('whyUs.title', { defaultValue: 'Why Choose Attentive?' });
  const items = t('whyUs.items', { returnObjects: true, defaultValue: [] }) as any[];

  return (
    <section className="py-24 bg-[#FEFAF6]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#142C52] text-center mb-16">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-[#142C52] mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};