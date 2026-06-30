import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export function ServicesSection() {
  const { t } = useTranslation();
  const items = t("services", { returnObjects: true }) || [];
  return (
    <section id="services-section" className="bg-muted py-16 px-8">
      <div className="section-heading pb-12">
        <h2>Our Services</h2>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.isArray(items) && items.map((item, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
