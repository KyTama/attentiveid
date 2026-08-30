import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'framer-motion';

interface WhyUsItem {
  description: string;
  title: string;
}

export const WhyUs = () => {
  const { t } = useTranslation();
  const title = t('whyUs.title', { defaultValue: 'Why Choose Attentive?' });
  const items = t('whyUs.items', { returnObjects: true, defaultValue: [] }) as WhyUsItem[];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
  };

  const icons = [
    '/images/whyus/why-personalized.png',
    '/images/whyus/why-professional.png',
    '/images/whyus/why-flexible.png',
    '/images/whyus/why-private.png'
  ];

  return (
    <section id="why-us" className="py-24 bg-dominant relative overflow-hidden">
      <div className="container mx-auto px-4 z-10 relative">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {items.map((item, itemIndex) => (
            <motion.div 
              key={itemIndex}
              variants={itemVariants}
              className="bg-card p-8 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow text-center flex flex-col items-center"
            >
              <div className="w-full h-40 flex items-center justify-center mb-6">
                <img src={icons[itemIndex]} alt={item.title} className="max-w-full max-h-full object-contain" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
