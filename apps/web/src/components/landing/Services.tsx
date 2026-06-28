import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, Users, Activity } from "lucide-react";

export function Services() {
  const { t } = useTranslation();

  const services = [
    {
      id: "consultation",
      title: t("landing.services.items.consultation.title", "Consultation"),
      description: t("landing.services.items.consultation.desc", "Professional psychological consultation for personal growth and well-being."),
      icon: <Users className="w-10 h-10 text-primary mb-4" />,
      delayClass: "delay-100"
    },
    {
      id: "assessment",
      title: t("landing.services.items.assessment.title", "Assessment"),
      description: t("landing.services.items.assessment.desc", "Comprehensive psychological assessments and evaluations."),
      icon: <Brain className="w-10 h-10 text-primary mb-4" />,
      delayClass: "delay-200"
    },
    {
      id: "therapy",
      title: t("landing.services.items.therapy.title", "Therapy"),
      description: t("landing.services.items.therapy.desc", "Evidence-based therapeutic interventions tailored to your needs."),
      icon: <Activity className="w-10 h-10 text-primary mb-4" />,
      delayClass: "delay-300"
    }
  ];

  return (
    <section id="services" className="py-24 bg-muted-background">
      <div className="container mx-auto px-4">
        <div className="section-heading animate-fade-in-up">
          <h2>{t("landing.services.title")}</h2>
          <p>{t("landing.services.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className={`border-none shadow-sm hover:shadow-md transition-shadow animate-fade-in-up ${service.delayClass}`}>
              <CardHeader className="text-center pt-8 pb-4 flex flex-col items-center">
                {service.icon}
                <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground pb-8">
                <p>{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
