import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Home", id: "hero" },
    { label: "About", id: "about" },
    { label: "Skills", id: "skills" },
    { label: "Projects", id: "projects" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-smooth",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border card-shadow"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-3 sm:px-5 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollToSection("hero")}
            className="font-heading text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent hover:scale-105 transition-spring flex-shrink-0"
          >
            Dikshanta
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 lg:space-x-8 flex-1 justify-end">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-muted-foreground hover:text-foreground transition-smooth relative group hover:scale-105"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-glow scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </button>
            ))}
          </div>

          {/* Desktop Profile Icon & Theme Toggle */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            <ThemeToggle />
            <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors duration-300 hover:scale-110 transform">
              <img
                src="/images/person.jpeg"
                alt="Dikshanta Chapagain"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Mobile Menu Section */}
          <div className="lg:hidden flex items-center space-x-2 flex-shrink-0">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-primary/20">
              <img
                src="/images/person.jpeg"
                alt="Dikshanta Chapagain"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden mt-4 pb-4 animate-slide-up">
            <div className="flex flex-col space-y-3 bg-card/95 border border-border rounded-lg p-4 shadow-md">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-muted-foreground hover:text-foreground transition-smooth py-3 px-2 rounded-md text-base sm:text-lg hover:scale-105 animate-slide-in-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;