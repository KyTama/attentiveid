import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface Psychologist {
  name: string;
  nickname?: string;
  title?: string;
  category?: string;
  image: string;
  specializations?: string[];
  experience?: string;
  sipp?: string;
  reservationlink?: string;
  locations?: string[];
}

export function PsychologistsSection() {
  const { t } = useTranslation();
  const items = (t("psychologists", { returnObjects: true }) as Psychologist[]) || [];
  
  return (
    <section id="psychologists-section" className="bg-background py-16 px-4 md:px-8 relative overflow-hidden">
      <div className="section-heading pb-12 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Psychologists</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find the psychologist that's right for you.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-12 relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 pb-4 pt-2">
            {Array.isArray(items) && items.map((item, i) => (
              <CarouselItem key={i} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/4">
                <Card className="flex flex-col h-full overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full aspect-[4/5] bg-muted/30">
                    <img src={"/" + item.image} alt={item.name} className="w-full h-full object-cover object-top" loading="lazy" />
                  </div>
                  <CardHeader className="p-4 flex-none pb-2">
                    <CardTitle className="text-lg leading-tight">
                      {item.name}{item.title ? `, ${item.title}` : ""}
                    </CardTitle>
                    <CardDescription className="text-primary font-medium mt-1">
                      {item.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex-grow text-sm space-y-3">
                    {item.experience && (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Experience:</span> {item.experience}
                      </div>
                    )}
                    {item.sipp && item.sipp !== "-" && (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">SIPP:</span> {item.sipp}
                      </div>
                    )}
                    {item.locations && item.locations.length > 0 && (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Location:</span> {item.locations.join(", ")}
                      </div>
                    )}
                    {item.specializations && item.specializations.length > 0 && (
                      <div className="pt-2">
                        <div className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wider">Specializations</div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.specializations.map((spec, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto">
                    {item.reservationlink ? (
                      <Button asChild className="w-full">
                        <a href={item.reservationlink} target="_blank" rel="noopener noreferrer">
                          Schedule with {item.nickname || item.name.split(' ')[0]}
                        </a>
                      </Button>
                    ) : (
                      <Button disabled className="w-full" variant="outline">
                        Not Available
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-2 lg:-left-12 bg-background/80 backdrop-blur-sm hover:bg-accent" />
          <CarouselNext className="-right-2 lg:-right-12 bg-background/80 backdrop-blur-sm hover:bg-accent" />
        </Carousel>
      </div>
    </section>
  );
}
