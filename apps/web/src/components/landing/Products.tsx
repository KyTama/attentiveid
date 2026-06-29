import React from 'react';
import { useTranslation } from 'react-i18next';

export const Products = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-[#142C52] mb-8">Informasi Layanan Konsultasi</h2>
        {/* Placeholder for services */}
        <div className="mt-12">
          <a href="#" className="inline-block bg-[#142C52] text-white font-semibold py-3 px-8 rounded-full transition-colors">
            Download Catalog
          </a>
        </div>
      </div>
    </section>
  );
};