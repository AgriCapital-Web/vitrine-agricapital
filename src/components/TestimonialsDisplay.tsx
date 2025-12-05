import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Quote } from "lucide-react";

interface Testimonial {
  id: string;
  first_name: string;
  last_name: string;
  testimonial: string;
  photo_url: string | null;
  created_at: string;
  status?: string;
  is_agricapital_subscriber?: boolean;
}

const statusLabels: Record<string, Record<string, string>> = {
  planteur: { fr: "Planteur", en: "Farmer", ar: "مزارع", es: "Agricultor", de: "Bauer", zh: "种植者" },
  partenaire: { fr: "Partenaire", en: "Partner", ar: "شريك", es: "Socio", de: "Partner", zh: "合作伙伴" },
  investisseur: { fr: "Investisseur", en: "Investor", ar: "مستثمر", es: "Inversor", de: "Investor", zh: "投资者" },
  institution: { fr: "Institution / ONG", en: "Institution / NGO", ar: "مؤسسة", es: "Institución", de: "Institution", zh: "机构" },
  proprietaire: { fr: "Propriétaire terrien", en: "Landowner", ar: "مالك أرض", es: "Propietario", de: "Landbesitzer", zh: "土地所有者" },
  other: { fr: "Partenaire", en: "Partner", ar: "شريك", es: "Socio", de: "Partner", zh: "合作伙伴" },
};

const TestimonialsDisplay = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching testimonials:', error);
        return;
      }

      setTestimonials(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (testimonial: Testimonial) => {
    const status = (testimonial as any).status || 'other';
    const isSubscriber = (testimonial as any).is_agricapital_subscriber;
    
    const statusLabel = statusLabels[status]?.[language] || statusLabels[status]?.fr || statusLabels.other[language];
    
    if (status === 'planteur' && isSubscriber) {
      const subscriberText = {
        fr: "Souscripteur AgriCapital",
        en: "AgriCapital Subscriber",
        ar: "مشترك أغريكابيتال",
        es: "Suscriptor AgriCapital",
        de: "AgriCapital Abonnent",
        zh: "AgriCapital订户"
      };
      return {
        main: statusLabel,
        sub: subscriberText[language as keyof typeof subscriberText] || subscriberText.fr
      };
    }
    
    return { main: statusLabel, sub: null };
  };

  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'fr' ? 'Témoignages' : language === 'en' ? 'Testimonials' : language === 'ar' ? 'شهادات' : language === 'es' ? 'Testimonios' : language === 'de' ? 'Zeugnisse' : '见证'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'fr' ? 'Ce que nos partenaires disent de nous' : language === 'en' ? 'What our partners say about us' : language === 'ar' ? 'ما يقوله شركاؤنا عنا' : language === 'es' ? 'Lo que dicen nuestros socios' : language === 'de' ? 'Was unsere Partner über uns sagen' : '我们的合作伙伴如何评价我们'}
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => {
              const statusDisplay = getStatusDisplay(testimonial);
              return (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-4">
                    <div className="bg-card rounded-lg p-6 h-full flex flex-col shadow-medium border-l-4 border-t-4 border-r-4 border-b-4 border-t-agri-green border-r-agri-green border-b-agri-orange border-l-agri-orange hover:shadow-strong transition-smooth">
                      <Quote className="w-8 h-8 text-agri-green mb-4" />
                      
                      <p className="text-foreground mb-6 flex-grow italic">
                        "{testimonial.testimonial}"
                      </p>
                      
                      <div className="flex items-center gap-4 mt-auto">
                        {testimonial.photo_url ? (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-agri-green shadow-medium flex-shrink-0">
                            <img
                              src={testimonial.photo_url}
                              alt={`${testimonial.first_name} ${testimonial.last_name}`}
                              className="w-full h-full object-cover object-top"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl border-2 border-agri-green shadow-medium flex-shrink-0">
                            {testimonial.first_name[0]}{testimonial.last_name[0]}
                          </div>
                        )}
                        
                        <div>
                          <p className="font-semibold text-foreground">
                            {testimonial.first_name} {testimonial.last_name}
                          </p>
                          <p className="text-sm text-agri-green font-medium">
                            {statusDisplay.main}
                          </p>
                          {statusDisplay.sub && (
                            <p className="text-xs text-muted-foreground italic">
                              {statusDisplay.sub}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsDisplay;
