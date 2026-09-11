import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { useIntakeModal } from "@/components/intake";

export function HeroSection() {
  const { t } = useTranslation();
  const { openIntake } = useIntakeModal();
  return (
    <section id="hero-section" className="bg-background py-20 px-8 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground">
        {t("hero.title1")} {t("hero.title2")} {t("hero.title3")}
      </h1>
      <p className="text-base leading-relaxed mt-4 text-center max-w-2xl text-muted-foreground">
        {t("hero.tagline")}
      </p>
      <Button className="mt-8 btn-primary" onClick={() => openIntake()}>
        {t("cta.button")}
      </Button>
    </section>
  );
}
