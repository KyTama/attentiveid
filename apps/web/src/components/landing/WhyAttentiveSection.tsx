import { useTranslation } from "react-i18next";

export function WhyAttentiveSection() {
  const { t } = useTranslation();
  return (
    <section id="why-attentive-section" className="bg-background py-16 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="section-heading pb-8">
          <h2>{t("why_attentive.title")}</h2>
        </div>
        <div className="text-base leading-relaxed text-center text-muted-foreground" dangerouslySetInnerHTML={{ __html: t("why_attentive.content") }} />
      </div>
    </section>
  );
}
