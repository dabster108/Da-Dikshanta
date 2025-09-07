import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Brain, Heart, Users, Code } from "lucide-react";
import { useStaggeredScrollAnimation } from "@/hooks/use-scroll-animation";
import { useState, useEffect } from "react";

const ProjectsSection = () => {
  const projects = [
    {
      id: 1,
      title: "Daktar Saab",
      description: "An AI-powered mobile healthcare application built with Kotlin and Firebase. It helps patients manage their health efficiently with features like AI symptom checking, X-ray analysis, appointment booking, and hospital navigation. From mental health resources to medication reminders, Daktar Saab is your personal digital health assistant.",
      technologies: ["Kotlin", "Firebase", "AI/ML", "Mobile Development", "Healthcare"],
      githubUrl: "https://github.com/dabster108/DaktarSaab",
      image: "/images/daktarsaab.jpg",
      icon: <Heart className="w-5 h-5" />,
      featured: true
    },
    {
      id: 2,
      title: "Tuberculosis X-ray Prediction",
      description: "A deep learning project to detect Tuberculosis (TB) from chest X-ray images using a Convolutional Neural Network (CNN) built with PyTorch. Includes a FastAPI REST API and a simple HTML/CSS/JS frontend for uploading X-ray images and displaying real-time predictions with high accuracy.",
      technologies: ["PyTorch", "CNN", "FastAPI", "Deep Learning", "Medical AI"],
      githubUrl: "https://github.com/dabster108/Tuberculosis-X-ray-Prediction",
      image: "/images/daktarsaab.jpg",
      icon: <Brain className="w-5 h-5" />,
      featured: true
    },
    {
      id: 3,
      title: "FuturePath Finder",
      description: "A career recommendation system that uses a Random Forest Classifier to analyze student data and suggest potential career paths. Features data cleaning & preprocessing, feature importance analysis, and FastAPI-based web interface for seamless interaction.",
      technologies: ["Python", "Random Forest", "FastAPI", "Machine Learning", "Data Science"],
      githubUrl: "https://github.com/dabster108/FuturePathFinder",
      image: "/images/daktarsaab.jpg",
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 4,
      title: "Keywi Marketers",
      description: "A professional website developed with my friend Pratik Joshi for Keywi Marketers, a digital advertising company. Built using JavaScript, Node.js, and Tailwind CSS, focusing on performance, responsiveness, and a clean UI/UX design.",
      technologies: ["JavaScript", "Node.js", "Tailwind CSS", "Web Development", "UI/UX"],
      githubUrl: "https://github.com/dabster108/KEYWI-MARKETERS",
      image: "/images/daktarsaab.jpg",
      icon: <ExternalLink className="w-5 h-5" />
    },
    {
      id: 5,
      title: "Code Sika",
      description: "A software development project built with Gradle, showcasing structured source code aimed at solving specific programming tasks and larger applications. Demonstrates clean architecture and modern development practices.",
      technologies: ["Java", "Gradle", "Software Engineering", "Clean Code", "Architecture"],
      githubUrl: "https://github.com/dabster108/CodeSika",
      image: "/images/daktarsaab.jpg",
      icon: <Code className="w-5 h-5" />
    }
  ];

  const { containerRef, visibleItems } = useStaggeredScrollAnimation(projects.length);
  const [hasAnimated, setHasAnimated] = useState(Array(projects.length).fill(false));

  useEffect(() => {
    setHasAnimated((prev) =>
      prev.map((animated, index) => animated || visibleItems[index])
    );
  }, [visibleItems]);

  return (
    <section id="projects" className="py-20 bg-accent/20 relative overflow-hidden">
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

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Featured <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Projects</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Here are some of my recent projects that showcase my skills in AI/ML, web development, 
              mobile development, and problem-solving.
            </p>
          </div>

          <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`group relative transition-all duration-700 transform ${
                  hasAnimated[index]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: hasAnimated[index] ? `${index * 150}ms` : '0ms'
                }}
              >
                {/* Unified Animated Glow Border for ALL Cards - Placed OUTSIDE the card */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-xl opacity-0 group-hover:opacity-75 transition-all duration-700 blur-sm" />
                <div className="absolute -inset-0.5 bg-gradient-to-l from-blue-500 via-primary to-purple-600 rounded-xl opacity-0 group-hover:opacity-50 transition-all duration-500 blur-md" />

                <Card className={`relative overflow-hidden border-2 transform bg-card/90 backdrop-blur-sm ${
                  project.featured ? 'ring-2 ring-primary/30 border-primary/50 shadow-lg shadow-primary/20' : 'border-border'
                } h-full`}>
                  {/* All Card Content goes here */}
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="relative overflow-hidden rounded-t-lg h-32">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Project Icon Overlay */}
                      <div className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-black/90 rounded-full">
                        {project.icon}
                      </div>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="font-heading text-xl font-semibold flex items-center gap-2">
                        {project.title}
                        {project.featured && (
                          <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white border-0 text-xs animate-pulse">
                            Featured ⭐
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="mt-auto">
                      {/* Enhanced Tech Stack Section */}
                      <div className="bg-muted/30 p-4 rounded-lg border border-primary/10 mb-6">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <Badge 
                              key={tech} 
                              variant="secondary" 
                              className="text-xs bg-primary/10 font-medium border border-primary/20"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2 border-border"
                          onClick={() => window.open(project.githubUrl, '_blank')}
                        >
                          <Github className="w-4 h-4" />
                          View Code
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-border"
              onClick={() => window.open('https://github.com/dabster108', '_blank')}
            >
              View All Projects on GitHub
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;