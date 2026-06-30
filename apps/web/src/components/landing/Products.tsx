import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Products = () => {
  const { t } = useTranslation();

  const planIcons = {
    "checkup": '/images/services/service-checkup.png',
    "online": '/images/services/service-online.png',
    "offline": '/images/services/service-offline.png'
  };

  const pricingPlans = [
    {
      id: "checkup",
      title: "Mental Health Check-Up",
      description: "Sesi singkat bersama psikolog untuk membantu memahami kondisi awal dan menentukan langkah yang sesuai dengan kebutuhan Anda.",
      price: "200.000",
      features: [
        "Konsultasi melalui online call",
        "Psikolog sesuai kebutuhan Anda",
        "Lebih fleksibel dan nyaman"
      ],
      popular: false
    },
    {
      id: "online",
      title: "Konsultasi Online",
      description: "Sesi konsultasi bersama psikolog profesional dari mana saja dengan jadwal yang dapat disesuaikan.",
      price: "475.000",
      features: [
        "Konsultasi melalui video atau voice call",
        "Psikolog sesuai kebutuhan Anda",
        "Lebih fleksibel dan nyaman"
      ],
      popular: true
    },
    {
      id: "offline",
      title: "Konsultasi Offline",
      description: "Ruang konsultasi yang aman dan nyaman bersama psikolog profesional di lokasi Attentive (Jakarta/BSD).",
      price: "525.000",
      features: [
        "Tersedia di Jakarta & BSD",
        "Bertemu langsung dengan psikolog",
        "Lingkungan nyaman dan privat"
      ],
      popular: false
    }
  ];

  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Informasi Layanan Konsultasi</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Kami menyediakan berbagai pilihan layanan psikologi yang dapat disesuaikan dengan kebutuhan Anda.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`relative flex flex-col p-8 rounded-3xl border ${plan.popular ? 'border-primary shadow-lg bg-[#FFFDF8]' : 'border-border shadow-sm bg-card'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Pilihan Fleksibel
                </div>
              )}
              
              <div className="mb-6 flex flex-col items-start gap-4">
                <div className="h-28 flex items-center justify-start drop-shadow-sm w-full">
                  <img src={planIcons[plan.id as keyof typeof planIcons]} alt={plan.title} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.title}</h3>
                  <p className="text-muted-foreground text-sm min-h-[60px]">{plan.description}</p>
                </div>
              </div>

              <div className="mb-8 flex-grow">
                <div className="text-sm text-muted-foreground mb-1">Mulai dari</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground">Rp</span>
                  <span className="text-4xl font-extrabold text-primary">{plan.price}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">per sesi</div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button className={`w-full py-6 text-lg rounded-xl ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-foreground text-background hover:bg-foreground/90'}`}>
                <Calendar className="mr-2 w-5 h-5" /> Jadwalkan
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};