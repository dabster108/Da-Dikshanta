import { Button } from "@/components/ui/button";
import { ArrowDown, Download, Github, Linkedin, Mail, Twitter } from "lucide-react";
import { useState, useEffect } from "react";
import ParticlesBackground from "../ParticlesBackground";

// New component for the text animation
const AnimatedText = ({ phrases, speed = 100, delay = 1500 }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentPhrase = phrases[currentPhraseIndex];

    const handleType = () => {
      // Typing logic
      if (!isDeleting) {
        setCurrentText(currentPhrase.substring(0, currentText.length + 1));
        if (currentText === currentPhrase) {
          timer = setTimeout(() => setIsDeleting(true), delay);
        }
      } else {
        // Deleting logic
        setCurrentText(currentPhrase.substring(0, currentText.length - 1));
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        }
      }
      return () => clearTimeout(timer);
    };

    const typingSpeed = isDeleting ? speed / 2 : speed;
    timer = setTimeout(handleType, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phrases, currentPhraseIndex, speed, delay]);

  return (
    <span className="relative inline-block">
      {currentText}
      <span className="absolute right-0 bottom-0 top-0 w-0.5 bg-foreground animate-blink" />
    </span>
  );
};

const HeroSection = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const animatedPhrases = [
    "AI/ML Enthusiast",
    "Exploring the Future of AI"
  ];

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/20 px-4 sm:px-6 lg:px-8"
    >
      <ParticlesBackground />
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-glow rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl sm:max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <div className="animate-fade-in">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="animate-text-shimmer">
                Dikshanta Chapagain
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <AnimatedText phrases={animatedPhrases} />
            </p>
            
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl sm:max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              I craft intelligent solutions that blend cutting-edge AI technology with innovative design. 
              Passionate about creating AI-powered experiences that shape the future.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <Button
              onClick={() => scrollToSection("projects")}
              className="hero-gradient hero-gradient-hover text-primary-foreground px-8 py-3 text-lg transition-smooth hover:scale-105 hover:glow-shadow animate-glow"
            >
              View My Work
            </Button>
            
            <Button
              variant="outline"
              className="px-8 py-3 text-lg transition-smooth hover:scale-105 hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                const cvPath = '/cv/Dikshanta_Chapgain_Cv.pdf';
                const downloadCV = () => {
                  const link = document.createElement('a');
                  link.href = cvPath;
                  link.download = 'Dikshanta_Chapagain_CV.pdf';
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                };
                const openCV = () => {
                  const newWindow = window.open('', '_blank');
                  if (newWindow) {
                    newWindow.document.write(`
                      <html>
                        <head>
                          <title>Dikshanta Chapagain - CV</title>
                          <style>
                            body { margin: 0; padding: 0; background: #f0f0f0; }
                            iframe { width: 100%; height: 100vh; border: none; }
                          </style>
                        </head>
                        <body>
                          <iframe src="${cvPath}" type="application/pdf">
                            <p>Your browser doesn't support PDFs. <a href="${cvPath}" download="Dikshanta_Chapagain_CV.pdf">Download the PDF</a>.</p>
                          </iframe>
                        </body>
                      </html>
                    `);
                    newWindow.document.close();
                  } else {
                    window.location.href = cvPath;
                  }
                };
                try {
                  downloadCV();
                } catch (error) {
                  console.log('Download failed, opening in new window');
                  openCV();
                }
              }}
            >
              <Download className="mr-2 h-5 w-5" />
              Download CV
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 mb-16 animate-slide-up" style={{ animationDelay: "0.8s" }}>
            <Button variant="ghost" size="icon" asChild className="hover:scale-110 transition-spring hover:text-primary">
              <a href="https://github.com/dabster108" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-6 w-6" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hover:scale-110 transition-spring hover:text-primary">
              <a href="https://www.linkedin.com/in/dikshantachapagain/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-6 w-6" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hover:scale-110 transition-spring hover:text-primary">
              <a href="https://x.com/_savage108" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="h-6 w-6" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hover:scale-110 transition-spring hover:text-primary">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dikshanta108@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email">
                <Mail className="h-6 w-6" />
              </a>
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