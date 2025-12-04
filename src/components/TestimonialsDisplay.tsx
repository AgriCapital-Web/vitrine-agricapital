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
}

const TestimonialsDisplay = () => {
  const { t } = useLanguage();
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

  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Témoignages
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ce que nos partenaires disent de nous
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
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-4">
                  <div className="bg-card rounded-lg p-6 h-full flex flex-col shadow-medium border-l-4 border-t-4 border-r-4 border-b-4 border-t-agri-green border-r-agri-green border-b-agri-orange border-l-agri-orange hover:shadow-strong transition-smooth">
                    <Quote className="w-8 h-8 text-agri-green mb-4" />
                    
                    <p className="text-foreground mb-6 flex-grow italic">
                      "{testimonial.testimonial}"
                    </p>
                    
                    <div className="flex items-center gap-4 mt-auto">
                      {testimonial.photo_url ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-agri-green shadow-medium">
                          <img
                            src={testimonial.photo_url}
                            alt={`${testimonial.first_name} ${testimonial.last_name}`}
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl border-2 border-agri-green shadow-medium">
                          {testimonial.first_name[0]}{testimonial.last_name[0]}
                        </div>
                      )}
                      
                      <div>
                        <p className="font-semibold text-foreground">
                          {testimonial.first_name} {testimonial.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Partenaire AgriCapital
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsDisplay;