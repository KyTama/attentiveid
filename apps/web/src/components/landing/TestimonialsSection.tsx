import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";

export function TestimonialsSection() {
  const { t } = useTranslation();
  const items = t("testimonials", { returnObjects: true }) || [];
  const title = t("testimonials.title", { defaultValue: "Pengalaman Klien Bersama Attentive" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
  };

  return (
    <section id="testimonials-section" className="bg-background py-24 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-dominant/50 -skew-y-3 origin-top-left -z-10" />

      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {Array.isArray(items) && items.map((item: any, i: number) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="h-full flex flex-col border-border shadow-sm hover:shadow-md transition-shadow bg-card relative z-10">
                <CardContent className="flex-grow pt-8 px-8 relative">
                  <Quote className="w-10 h-10 text-primary/20 absolute top-4 left-4 -z-10" />
                  <p className="italic text-foreground/80 leading-relaxed text-lg">"{item.content}"</p>
                </CardContent>
                <CardFooter className="px-8 pb-8 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Klien Attentive</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
