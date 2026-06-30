import { useTranslation } from "react-i18next";

export function AboutUsSection() {
  const { t } = useTranslation();
  return (
    <section id="about-us-section" className="bg-background py-16 px-8">
      <div className="bg-muted p-8 rounded-xl max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground">{t("about_us.title")}</h2>
        <p className="text-base leading-relaxed mt-4 text-muted-foreground">{t("about_us.content1")}</p>
        <p className="text-base leading-relaxed mt-2 text-muted-foreground">{t("about_us.content2")}</p>
      </div>
    </section>
  );
}
