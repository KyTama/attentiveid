import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-footer-background py-12 border-t border-border mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold font-sans text-secondary mb-4">
              {t("hero.brand", "AttentiveId")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("hero.tagline", "Professional psychological services for your well-being.")}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-sm transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-sm transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-sm transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-sm transition-all">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#hero" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.home", "Home")}
                </a>
              </li>
              <li>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.services", "Services")}
                </a>
              </li>
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.about", "About Us")}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.contact", "Contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("services.items.consultation.title", "Consultation")}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("services.items.assessment.title", "Assessment")}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("services.items.therapy.title", "Therapy")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-foreground mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">123 Therapy Lane, Wellness District, Jakarta</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-muted-foreground">hello@attentiveid.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("hero.brand", "AttentiveId")}. {t("footer.copyright", "All rights reserved.")}
          </p>
        </div>
      </div>
    </footer>
  );
}
