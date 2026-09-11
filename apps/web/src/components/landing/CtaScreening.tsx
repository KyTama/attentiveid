import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useIntakeModal } from '@/components/intake';

export const CtaScreening = () => {
  const { t } = useTranslation();
  const { openIntake } = useIntakeModal();
  const title = t('ctaScreening.title', { defaultValue: 'Siap untuk langkah pertama?' });
  const subtitle = t('ctaScreening.subtitle', { defaultValue: 'Mulai perjalanan kesehatan mental Anda bersama psikolog profesional kami.' });
  const buttonText = t('ctaScreening.button', { defaultValue: 'Mulai Konsultasi' });

  return (
    <section className="py-24 bg-foreground text-background text-center">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{title}</h2>
          <p className="text-lg md:text-xl text-background/80 mb-10">{subtitle}</p>
          <Button
            size="lg"
            onClick={() => openIntake()}
            className="bg-primary hover:bg-primary/90 text-secondary font-bold rounded-full px-10 py-6 text-lg cursor-pointer transition-transform hover:scale-105"
          >
            {buttonText}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};