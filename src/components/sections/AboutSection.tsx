import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const AboutSection = () => {
  const { elementRef: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: imageRef, isVisible: imageVisible } = useScrollAnimation({ threshold: 0.3 });
  const { elementRef: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.3 });

  const highlights = [
    "Proficient in AI/ML technologies and frameworks",
    "Experience with intelligent system development",
    "Passionate about exploring the future of AI",
    "Committed to creating innovative AI solutions",
  ];

  return (
    <section ref={sectionRef} id="about" className="py-20 bg-accent/20 relative overflow-hidden">
      {/* Background Decorative Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center animate-float">
          <img src="/favicon.ico" alt="" className="w-6 h-6 opacity-20" />
        </div>
        <div className="absolute bottom-20 left-20 w-16 h-16 rounded-full bg-primary-glow/10 flex items-center justify-center animate-float" style={{ animationDelay: "1.5s" }}>
          <img src="/favicon.ico" alt="" className="w-8 h-8 opacity-15" />
        </div>
        <div className="absolute top-1/2 right-1/4 w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center animate-float" style={{ animationDelay: "2.5s" }}>
          <img src="/favicon.ico" alt="" className="w-5 h-5 opacity-25" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl md:max-w-6xl mx-auto">
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              About <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Me</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI/ML enthusiast with a passion for creating intelligent digital experiences
            </p>
          </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Profile Image */}
      <div ref={imageRef} className={`relative group transition-all duration-1000 delay-300 ${
              imageVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}>
              <Card className="p-8 card-shadow transition-smooth hover:card-shadow-hover overflow-hidden hover:scale-105">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary-glow/10">
                  <img
                    src="/images/me.jpeg"
                    alt="Dikshanta Chapagain"
        className="w-full h-full object-cover object-center transition-smooth group-hover:scale-105"
        style={{ objectPosition: '50% 20%' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                </div>
              </Card>
              
              {/* Floating decoration elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-glow/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>

            {/* Content */}
            <div ref={contentRef} className={`space-y-6 transition-all duration-1000 delay-500 ${
              contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}>
              <div className={`transition-all duration-1000 delay-700 ${
                contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <h3 className="font-heading text-2xl font-semibold mb-4">
                  Crafting AI-Powered Solutions
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  I'm a passionate AI/ML enthusiast with a strong foundation in modern web technologies 
                  and artificial intelligence. My journey in software development has been driven by 
                  curiosity about the future of AI and a desire to create intelligent digital experiences 
                  that solve real-world problems.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  I specialize in building AI-powered applications that combine machine learning capabilities 
                  with elegant user interfaces. Whether it's implementing neural networks, developing 
                  intelligent automation systems, or creating data-driven solutions, I bring innovation 
                  and creativity to every AI project.
                </p>
              </div>

              {/* Highlights */}
              <div className={`space-y-3 transition-all duration-1000 delay-900 ${
                contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {highlights.map((highlight, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-3 transition-all duration-500 ${
                      contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${1000 + index * 100}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Technologies */}
              <div className={`transition-all duration-1000 delay-1200 ${
                contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <h4 className="font-semibold mb-3">Currently working with:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Python", "Deep Learning", "PyTorch", "TypeScript", "Scikit-learn", 
                    "Machine Learning", "OpenAI API", "Neural Networks", "Kotlin", 
                    "Firebase", "Mobile Development", "Prompt Engineering" ,"React"
                  ].map((tech, index) => (
                    <Badge 
                      key={tech} 
                      variant="secondary" 
                      className={`px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-all cursor-default hover:scale-110 ${
                        contentVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                      style={{ 
                        transitionDelay: `${1300 + index * 80}ms`,
                        transitionDuration: '500ms'
                      }}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;