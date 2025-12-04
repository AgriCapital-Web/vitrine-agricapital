import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import WelcomePopup from "@/components/WelcomePopup";
import Ambitions from "@/components/Ambitions";
import About from "@/components/About";
import Approach from "@/components/Approach";
import Impact from "@/components/Impact";
import IvoryCoastMap from "@/components/IvoryCoastMap";
import Milestones from "@/components/Milestones";
import Founder from "@/components/Founder";
import Partnership from "@/components/Partnership";
import TestimonialsDisplay from "@/components/TestimonialsDisplay";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      <WelcomePopup />
      <Navigation />
      <Hero />
      <Ambitions />
      <About />
      <Approach />
      <Impact />
      <IvoryCoastMap />
      <Milestones />
      <Founder />
      <Partnership />
      <TestimonialsDisplay />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
