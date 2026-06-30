import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export function ClinicsLocationsSection() {
  const { t } = useTranslation();
  const locations = t("clinics_locations.locations", { returnObjects: true }) || [];
  return (
    <section id="clinics-locations-section" className="bg-background py-16 px-8">
      <div className="section-heading pb-12">
        <h2>{t("clinics_locations.title")}</h2>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.isArray(locations) && locations.map((loc, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">{loc.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{loc.address}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
