import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Globe, Smartphone, Cloud, Palette } from "lucide-react";

const SkillsSection = () => {
  const skillCategories = [
    {
      icon: Code,
      title: "Frontend Development",
      skills: ["React", "TypeScript", "Vue.js", "Next.js", "Tailwind CSS", "SASS"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Database,
      title: "Backend Development",
      skills: ["Node.js", "Python", "PostgreSQL", "MongoDB", "GraphQL", "REST APIs"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Cloud,
      title: "DevOps & Cloud",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Monitoring"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Development",
      skills: ["React Native", "Flutter", "iOS", "Android", "PWA", "Capacitor"],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Palette,
      title: "Design & UX",
      skills: ["Figma", "Adobe XD", "UI/UX Design", "Prototyping", "User Research", "Wireframing"],
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Globe,
      title: "Tools & Others",
      skills: ["Git", "Linux", "Agile", "Testing", "Security", "Performance"],
      color: "from-teal-500 to-blue-500"
    }
  ];

  return (
    <section id="skills" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Skills & <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Expertise</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive toolkit for building modern, scalable applications
            </p>
          </div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category, index) => (
              <Card 
                key={category.title} 
                className="p-6 card-shadow transition-smooth hover:card-shadow-hover hover:scale-105 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-spring`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg mb-4 group-hover:text-primary transition-smooth">
                  {category.title}
                </h3>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className="text-sm hover:bg-primary hover:text-primary-foreground transition-smooth cursor-default"
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