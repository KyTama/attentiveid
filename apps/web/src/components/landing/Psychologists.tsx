import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
// Mock import for Carousel since it might not be fully initialized
const Carousel = ({ children }: { children: ReactNode }) => <div className="carousel">{children}</div>;
const CarouselContent = ({ children }: { children: ReactNode }) => <div className="flex overflow-x-auto space-x-4">{children}</div>;
const CarouselItem = ({ children }: { children: ReactNode }) => <div className="flex-none w-64">{children}</div>;
const CarouselNext = () => <button>Next</button>;
const CarouselPrevious = () => <button>Prev</button>;

interface PsychologistItem {
  name: string;
  category: string;
}

export const Psychologists = () => {
  const { t } = useTranslation();
  const title = t('nav.psychologists', { defaultValue: 'Attentive Psychologist Team' });
  const items = t('psychologists', { returnObjects: true, defaultValue: [] }) as PsychologistItem[];

  return (
    <section className="py-24 bg-[#FEFAF6]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-[#142C52] text-center mb-16">{title}</h2>
        <Carousel>
          <CarouselContent>
            {items.map((psychologist, psychologistIndex) => (
              <CarouselItem key={psychologistIndex}>
                <div className="bg-white p-6 rounded-lg text-center shadow-sm">
                  <h3 className="font-semibold text-lg">{psychologist.name}</h3>
                  <p className="text-slate-600">{psychologist.category}</p>
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
