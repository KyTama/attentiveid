import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ClinicLocation {
  address: string;
  maps_link: string;
  name: string;
}

export const Contact = () => {
  const { t } = useTranslation();
  const title = t('clinics_locations.title', { defaultValue: 'Lokasi Klinik Kami' });
  const items = t('clinics_locations.locations', { returnObjects: true, defaultValue: [] }) as ClinicLocation[];

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((location, locationIndex) => (
            <motion.div
              key={locationIndex}
              initial={{ opacity: 0, x: locationIndex % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full border-border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-8 flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-foreground mb-3">{location.name}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">{location.address}</p>
                    <a href={location.maps_link} className="inline-flex items-center text-primary font-semibold hover:underline">
                      {t('contact.viewOnMaps', { defaultValue: 'Lihat di Google Maps' })}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
