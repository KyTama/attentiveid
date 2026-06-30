import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";

export function CTASection() {
  const { t } = useTranslation();
  return (
    <section id="cta-section" className="bg-muted py-20 px-8 text-center">
      <h2 className="text-4xl font-bold mb-8 text-foreground">{t("cta.title")}</h2>
      <Button className="btn-primary">
        {t("cta.button")}
      </Button>
    </section>
  );
}
