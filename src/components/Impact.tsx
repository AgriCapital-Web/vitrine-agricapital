import { Card, CardContent } from "@/components/ui/card";
import gatheringImage1 from "@/assets/community-meeting-1.jpg";
import gatheringImage2 from "@/assets/community-meeting-2.jpg";
import gatheringImage3 from "@/assets/community-meeting-3.png";
import gatheringImage4 from "@/assets/community-meeting-4.jpg";
import gatheringImage5 from "@/assets/community-meeting-5.jpg";
import gatheringImage6 from "@/assets/community-meeting-6.jpg";
import gatheringImage7 from "@/assets/community-meeting-7.jpg";
import gatheringImage8 from "@/assets/community-meeting-8.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Impact = () => {
  const { t } = useLanguage();
  
  const results = [
    { number: t.impact.results.communities.title, label: t.impact.results.communities.desc },
    { number: t.impact.results.land.title, label: t.impact.results.land.desc },
    { number: t.impact.results.localities.title, label: t.impact.results.localities.desc },
    { number: t.impact.results.years.title, label: t.impact.results.years.desc },
  ];

  const galleryImages = [
    gatheringImage1,
    gatheringImage2,
    gatheringImage3,
    gatheringImage4,
    gatheringImage5,
    gatheringImage6,
    gatheringImage7,
    gatheringImage8,
  ];

  return (
    <section id="impact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.impact.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.impact.subtitle}
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          {results.map((result, index) => (
            <Card key={index} className="bg-gradient-primary border-0">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {result.number}
                </div>
                <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium leading-tight break-words">
                  {result.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Study Results */}
        <div className="mb-16 bg-secondary/30 rounded-2xl p-6 md:p-8 lg:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            {t.impact.results.title}
          </h3>
          <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>{t.impact.results.description1}</p>
            <p className="font-semibold text-foreground">
              {t.impact.results.description2}
            </p>
          </div>
        </div>

        {/* Community Gatherings Gallery - Carousel */}
        <div className="mb-16">
          <h4 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">
            {t.impact.galleryTitle}
          </h4>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full max-w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {galleryImages.map((image, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="rounded-2xl overflow-hidden shadow-medium aspect-[4/3]">
                    <img
                      src={image}
                      alt={`${t.impact.galleryTitle} ${index + 1}`}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 md:-left-6" />
            <CarouselNext className="-right-2 md:-right-6" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Impact;
