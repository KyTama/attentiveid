import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="section-heading animate-fade-in-up">
          <h2>{t("landing.about.title", "About Us")}</h2>
          <p>{t("landing.about.subtitle", "Our mission and values")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="order-2 md:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="aspect-video bg-muted rounded-xl flex flex-col items-center justify-center text-muted-foreground shadow-sm">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <span>Clinic Photo Placeholder</span>
            </div>
          </motion.div>

          <motion.div 
            className="order-1 md:order-2 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-foreground">
              {t("landing.about.heading", "Dedicated to Your Mental Health")}
            </h3>
            <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
              <p>{t("landing.about.content")}</p>
              <p>{t("landing.about.content2", "Our team of experienced psychologists provides a safe and supportive environment for you to explore your thoughts and feelings.")}</p>
            </div>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  10+
                </div>
                <div>
                  <div className="font-bold text-foreground">Years Experience</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  1k+
                </div>
                <div>
                  <div className="font-bold text-foreground">Happy Clients</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
