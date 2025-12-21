import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import jalonImage1 from "@/assets/jalon-1.jpg";
import jalonImage2 from "@/assets/jalon-2.jpg";
import jalonImage3 from "@/assets/jalon-3.jpg";
import jalonImage4 from "@/assets/jalon-4.jpg";
import jalonImage5 from "@/assets/jalon-5.jpg";
import jalonImage6 from "@/assets/jalon-6.jpg";
import jalonImage7 from "@/assets/jalon-7.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Milestones = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryImages = [
    jalonImage1,
    jalonImage2,
    jalonImage3,
    jalonImage4,
    jalonImage5,
    jalonImage6,
    jalonImage7,
  ];

  return (
    <section id="jalons" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.milestones.title}
          </h2>
        </div>

        <Card className="bg-card border-border mb-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-agri-green mb-4">
              {t.milestones.eventTitle}
            </h3>
            
            <div className="prose max-w-none text-muted-foreground space-y-4">
              <p>{t.milestones.description1}</p>
              <p>{t.milestones.description2}</p>
              <p>{t.milestones.description3}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12">
          <h4 className="text-xl font-bold text-foreground mb-6 text-center">
            {t.milestones.galleryTitle}
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
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/3 lg:basis-1/4">
                  <div
                    className="cursor-pointer overflow-hidden rounded-lg hover:shadow-medium transition-smooth aspect-[4/3]"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${t.milestones.galleryTitle} ${index + 1}`}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-smooth"
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

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {selectedImage && (
            <img
              src={selectedImage}
              alt={t.milestones.galleryTitle}
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Milestones;
