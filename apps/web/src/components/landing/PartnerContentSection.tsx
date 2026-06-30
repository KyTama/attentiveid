import { useTranslation } from "react-i18next";

export function PartnerContentSection() {
  const { t } = useTranslation();
  return (
    <section id="partner-content-section" className="bg-background py-16 px-8 text-center">
      <div className="section-heading pb-4">
        <h2>{t("partner_content.title")}</h2>
        <p>{t("partner_content.description")}</p>
      </div>
    </section>
  );
}
