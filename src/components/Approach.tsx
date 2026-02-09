import { Card, CardContent } from "@/components/ui/card";
import nurseryImage from "@/assets/nursery-dec-2025-1.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

// Function to convert Western Arabic numerals to other numeral systems
const convertNumber = (num: string, language: string): string => {
  if (language === "ar") {
    // Arabic numerals
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.split("").map(digit => arabicNumerals[parseInt(digit)] || digit).join("");
  }
  if (language === "zh") {
    // Chinese numerals
    const chineseNumerals = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    return num.split("").map(digit => chineseNumerals[parseInt(digit)] || digit).join("");
  }
  return num;
};

const Approach = () => {
  const { t, language } = useLanguage();
  
  const steps = [
    {
      number: convertNumber("01", language),
      title: t.approach.steps.prospecting.title,
      description: t.approach.steps.prospecting.desc,
    },
    {
      number: convertNumber("02", language),
      title: t.approach.steps.development.title,
      description: t.approach.steps.development.desc,
    },
    {
      number: convertNumber("03", language),
      title: t.approach.steps.followup.title,
      description: t.approach.steps.followup.desc,
    },
    {
      number: convertNumber("04", language),
      title: t.approach.steps.harvest.title,
      description: t.approach.steps.harvest.desc,
    },
    {
      number: convertNumber("05", language),
      title: t.approach.steps.payment.title,
      description: t.approach.steps.payment.desc,
    },
  ];

  const services = [
    { icon: "🌱", title: t.approach.services.inputs.title, description: t.approach.services.inputs.desc },
    { icon: "📚", title: t.approach.services.technical.title, description: t.approach.services.technical.desc },
    { icon: "✅", title: t.approach.services.marketing.title, description: t.approach.services.marketing.desc },
  ];

  return (
    <section id="approche" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.approach.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.approach.subtitle}
          </p>
        </div>

        {/* Nursery Image */}
        <div className="mb-16 rounded-2xl overflow-hidden shadow-medium">
          <img
            src={nurseryImage}
            alt="Site de pépinière AgriCapital - Plants de palmiers Tenera"
            className="w-full h-[300px] md:h-[400px] object-cover"
            loading="lazy"
          />
        </div>

        {/* Steps */}
        <div className="mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
            {t.approach.subtitle}
          </h3>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-medium transition-smooth">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="text-6xl font-bold text-accent/20">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                        {step.title}
                      </h4>
                      <p className="text-muted-foreground text-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
            {t.approach.services.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-medium transition-smooth">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{service.title}</h4>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Approach;
