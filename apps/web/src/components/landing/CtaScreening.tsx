import React from 'react';
import { useTranslation } from 'react-i18next';

export const CtaScreening = () => {
  const { t } = useTranslation();
  const title = t('ctaScreening.title', { defaultValue: 'Take the First Step with Attentive' });
  const buttonText = t('ctaScreening.button', { defaultValue: 'Start Screening' });

  return (
    <section className="py-24 bg-[#142C52] text-white text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        <button className="bg-[#D6A74D] hover:bg-opacity-90 text-white font-semibold py-3 px-8 rounded-full transition-colors">
          {buttonText}
        </button>
      </div>
    </section>
  );
};