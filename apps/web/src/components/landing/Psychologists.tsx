import React from 'react';
import { useTranslation } from 'react-i18next';
// Mock import for Carousel since it might not be fully initialized
const Carousel = ({ children }) => <div className="carousel">{children}</div>;
const CarouselContent = ({ children }) => <div className="flex overflow-x-auto space-x-4">{children}</div>;
const CarouselItem = ({ children }) => <div className="flex-none w-64">{children}</div>;
const CarouselNext = () => <button>Next</button>;
const CarouselPrevious = () => <button>Prev</button>;

export const Psychologists = () => {
  const { t } = useTranslation();
  const title = t('psychologists.title', { defaultValue: 'Attentive Psychologist Team' });
  const items = t('psychologists.items', { returnObjects: true, defaultValue: [] }) as any[];

  return (
    <section className="py-24 bg-[#FEFAF6]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#142C52] text-center mb-16">{title}</h2>
        <Carousel>
          <CarouselContent>
            {items.map((psy, idx) => (
              <CarouselItem key={idx}>
                <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                  <h3 className="font-semibold text-lg">{psy.name}</h3>
                  <p className="text-slate-600">{psy.specialty}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8 space-x-4">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
};