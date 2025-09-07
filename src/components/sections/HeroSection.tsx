import { Button } from "@/components/ui/button";
import { ArrowDown, Download, Github, Linkedin, Mail, Twitter } from "lucide-react";

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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-glow rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Decorative Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-float">
          <img src="/favicon.ico" alt="" className="w-8 h-8 opacity-30" />
        </div>
        <div className="absolute top-1/2 left-10 w-12 h-12 rounded-full bg-primary-glow/10 flex items-center justify-center animate-float" style={{ animationDelay: "2s" }}>
          <img src="/favicon.ico" alt="" className="w-6 h-6 opacity-20" />
        </div>
        <div className="absolute bottom-32 right-1/3 w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center animate-float" style={{ animationDelay: "3s" }}>
          <img src="/favicon.ico" alt="" className="w-7 h-7 opacity-25" />
        </div>
        <div className="absolute top-3/4 left-1/3 w-10 h-10 rounded-full bg-primary-glow/20 flex items-center justify-center animate-float" style={{ animationDelay: "4s" }}>
          <img src="/favicon.ico" alt="" className="w-5 h-5 opacity-15" />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <div className="animate-fade-in">
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Dikshanta Chapagain
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              AI/ML Enthusiast Exploring Future of AI
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              I craft intelligent solutions that blend cutting-edge AI technology with innovative design. 
              Passionate about creating AI-powered experiences that shape the future.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <Button
              onClick={() => scrollToSection("projects")}
              className="hero-gradient hero-gradient-hover text-white px-8 py-3 text-lg transition-smooth hover:scale-105 hover:glow-shadow animate-glow"
            >
              View My Work
            </Button>
            
            <Button
              variant="outline"
              className="px-8 py-3 text-lg transition-smooth hover:scale-105 hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                // Improved PDF handling with multiple fallbacks
                const cvPath = '/cv/Dikshanta_Chapgain_Cv.pdf';
                
                // Method 1: Direct download
                const downloadCV = () => {
                  const link = document.createElement('a');
                  link.href = cvPath;
                  link.download = 'Dikshanta_Chapagain_CV.pdf';
                  link.style.display = 'none';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                };

                // Method 2: Open in new window with proper headers
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
                    // Fallback: direct link
                    window.location.href = cvPath;
                  }
                };

                // Try download first, then fallback to viewing
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
          <div className="flex items-center justify-center space-x-6 mb-16 animate-slide-up" style={{ animationDelay: "0.8s" }}>
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