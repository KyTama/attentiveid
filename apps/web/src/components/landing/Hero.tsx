import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-dominant">
      <div className="container mx-auto px-4 text-center z-10">
        <motion.p
          className="text-lg md:text-xl text-secondary mb-2 font-medium"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {t("landing.hero.hello")}
        </motion.p>
        
        <motion.h1 
          className="text-5xl md:text-7xl font-bold tracking-tight mb-4 font-sans text-secondary" 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }} 
          viewport={{ once: true }}
        >
          {t("landing.hero.weAre")} <span className="text-primary">{t("landing.hero.brand")}</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {t("landing.hero.tagline")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-lg font-medium shadow-lg transition-all duration-300">
            {t("landing.hero.cta_book")}
          </Button>
        </motion.div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10" />
    </section>
  );
}
