import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[url('/images/hero.webp')] bg-cover bg-center">
      <div className="absolute inset-0 bg-dominant/80"></div>
      <div className="container mx-auto px-4 text-center z-10 relative">
        <motion.p
          className="text-3xl md:text-4xl text-secondary mb-2 font-medium"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {t("hero.hello")}
        </motion.p>
        
        <motion.h1 
          data-route-heading
          tabIndex={-1}
          className="flex flex-col md:flex-row items-center justify-center gap-4 text-5xl md:text-7xl font-bold tracking-tight mb-4 font-sans text-secondary" 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }} 
          viewport={{ once: true }}
        >
          <span>{t("hero.weAre")}</span>
          <span className="text-primary">{t("hero.brand")}</span>
        </motion.h1>

        <motion.p
          className="text-2xl md:text-3xl font-semibold tracking-wide text-white/90 max-w-2xl mx-auto drop-shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {t("hero.tagline")}
        </motion.p>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl z-0 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl z-0 pointer-events-none" />
    </section>
  );
}
