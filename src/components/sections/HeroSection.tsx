import { Button } from "@/components/ui/button";
import { ArrowDown, Download, Github, Linkedin, Mail } from "lucide-react";

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-glow rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <div className="animate-fade-in">
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Alex Morgan
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Full-Stack Developer & Creative Technologist
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              I craft digital experiences that blend innovative technology with intuitive design. 
              Passionate about creating solutions that make a difference.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <Button
              onClick={() => scrollToSection("projects")}
              className="hero-gradient hero-gradient-hover text-white px-8 py-3 text-lg transition-smooth hover:scale-105 hover:glow-shadow"
            >
              View My Work
            </Button>
            
            <Button
              variant="outline"
              className="px-8 py-3 text-lg transition-smooth hover:scale-105 hover:bg-accent"
            >
              <Download className="mr-2 h-5 w-5" />
              Download CV
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center space-x-6 mb-16 animate-slide-up" style={{ animationDelay: "0.8s" }}>
            <Button variant="ghost" size="icon" className="hover:scale-110 transition-spring hover:text-primary">
              <Github className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:scale-110 transition-spring hover:text-primary">
              <Linkedin className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:scale-110 transition-spring hover:text-primary">
              <Mail className="h-6 w-6" />
            </Button>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={() => scrollToSection("about")}
            className="animate-bounce hover:scale-110 transition-spring opacity-70 hover:opacity-100"
            style={{ animationDelay: "1s" }}
          >
            <ArrowDown className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;