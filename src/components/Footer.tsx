import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo/Name */}
          <button
            onClick={scrollToTop}
            className="font-heading text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent hover:scale-105 transition-spring"
          >
            Alex Morgan
          </button>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-8 text-sm">
            {["Home", "About", "Skills", "Projects", "Contact"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  const element = document.getElementById(item.toLowerCase() === 'home' ? 'hero' : item.toLowerCase());
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-muted-foreground hover:text-foreground transition-smooth relative group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </button>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" className="hover:scale-110 transition-spring hover:text-primary">
              <Github className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:scale-110 transition-spring hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:scale-110 transition-spring hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Button>
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>© {currentYear} Alex Morgan. Made with</span>
            <Heart className="h-4 w-4 text-primary fill-current" />
            <span>and lots of coffee.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;