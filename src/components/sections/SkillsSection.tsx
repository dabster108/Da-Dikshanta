import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Globe, Smartphone, Cloud, Palette } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const SkillsSection = () => {
  const { elementRef: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.3 });
  const { elementRef: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.3 });
  const skillCategories = [
    {
      icon: Code,
      title: "AI & Machine Learning",
      skills: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        "Keras",
        "Pandas",
        "NumPy",
        "Matplotlib / Seaborn",
        "Deep Learning",
        "Machine Learning Algorithms",
        "OpenAI API",
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Database,
      title: "Backend Development",
      skills: [
        "Node.js",
        "Python (backend)",
        "PostgreSQL",
        "MongoDB",
        "GraphQL",
        "REST APIs",
        "SQL / NoSQL databases",
        "API Design & Development",
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Development",
      skills: [
        "Kotlin",
        "Android",
        "Firebase",
        "React Native",
        "Mobile UI/UX",
        "Cross-platform development",
      ],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Globe,
      title: "Frontend Development",
      skills: [
        "React",
        "TypeScript",
        "Next.js",
        "Tailwind CSS",
        "HTML / CSS / JavaScript",
        "Responsive Design",
        "UI/UX Principles",
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Cloud,
      title: "DevOps & Cloud",
      skills: ["Docker", "CI/CD", "Monitoring", "GitOps"],
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Palette,
      title: "Design & Tools",
      skills: [
        "Figma",
        "UI/UX Design",
        "Git",
        "Linux",
        "Photoshop / Illustrator",
        "Canva",
      ],
      color: "from-teal-500 to-blue-500"
    }
  ];

  return (
    <section ref={sectionRef} id="skills" className="py-20 bg-background relative overflow-hidden">
      {/* Background Decorative Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-14 h-14 rounded-full bg-primary/8 flex items-center justify-center animate-float">
          <img src="/favicon.ico" alt="" className="w-7 h-7 opacity-20" />
        </div>
        <div className="absolute bottom-16 right-20 w-12 h-12 rounded-full bg-primary-glow/10 flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
          <img src="/favicon.ico" alt="" className="w-6 h-6 opacity-15" />
        </div>
        <div className="absolute top-1/3 right-10 w-10 h-10 rounded-full bg-primary/12 flex items-center justify-center animate-float" style={{ animationDelay: "3s" }}>
          <img src="/favicon.ico" alt="" className="w-5 h-5 opacity-25" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl md:max-w-6xl mx-auto">
          {/* Section Header */}
          <div ref={headerRef} className={`text-center mb-16 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Skills & <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Expertise</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive toolkit for building intelligent, scalable applications
            </p>
          </div>

          {/* Skills Grid */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {skillCategories.map((category, index) => (
              <Card 
                key={category.title} 
        className={`p-4 sm:p-6 card-shadow transition-all duration-1000 hover:card-shadow-hover hover:scale-105 group hover-lift ${
                  gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${300 + index * 150}ms` }}
              >
                {/* Icon */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-spring animate-glow`}>
                  <category.icon className="h-6 w-6 text-primary-foreground" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg mb-4 group-hover:text-primary transition-smooth">
                  {category.title}
                </h3>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIndex) => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className={`text-sm hover:bg-primary hover:text-primary-foreground transition-all cursor-default hover:scale-110 ${
                        gridVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                      style={{ 
                        transitionDelay: `${500 + index * 150 + skillIndex * 50}ms`,
                        transitionDuration: '400ms'
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;