import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const AboutSection = () => {
  const highlights = [
    "5+ years of full-stack development experience",
    "Led teams of 3-8 developers on complex projects",
    "Built scalable applications serving 100k+ users",
    "Expert in modern web technologies and frameworks",
  ];

  return (
    <section id="about" className="py-20 bg-accent/20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              About <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Me</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Passionate developer with a love for creating exceptional digital experiences
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Profile Image */}
            <div className="relative">
              <Card className="p-8 card-shadow transition-smooth hover:card-shadow-hover">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-2xl flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">AM</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-2xl font-semibold mb-4">
                  Crafting Digital Solutions
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  I'm a passionate full-stack developer with over 5 years of experience building 
                  web applications that solve real-world problems. My journey started with a 
                  curiosity about how things work on the web, and it has evolved into a deep 
                  love for creating seamless user experiences backed by robust technology.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  When I'm not coding, you'll find me exploring new technologies, contributing 
                  to open-source projects, or sharing knowledge with the developer community. 
                  I believe in continuous learning and staying at the forefront of technology.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-3">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Technologies */}
              <div>
                <h4 className="font-semibold mb-3">Currently working with:</h4>
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "Python", "AWS", "Docker"].map((tech) => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1">
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