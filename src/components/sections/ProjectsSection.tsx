import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Brain, Heart, Users, Code, Music } from "lucide-react";
import { usePerItemFadeOnScroll } from "@/hooks/use-scroll-animation";
import { useState, useEffect } from "react";

const ProjectsSection = () => {
  const projects = [
    {
      id: 1,
      title: "Daktar Saab",
      description: "An AI-powered mobile healthcare application built with Kotlin and Firebase. It helps patients manage their health efficiently with features like AI symptom checking, X-ray analysis, appointment booking, and hospital navigation. From mental health resources to medication reminders, Daktar Saab is your personal digital health assistant.",
      technologies: ["Kotlin", "Firebase", "AI/ML", "Mobile Development", "Healthcare"],
      githubUrl: "https://github.com/dabster108/DaktarSaab",
      liveUrl: "https://github.com/dabster108/DaktarSaab/releases",
      image: "/images/doctor.png",
      icon: <Heart className="w-5 h-5" />,
      featured: true
    },
    {
      id: 2,
      title: "Tuberculosis X-ray Prediction",
      description: "A deep learning project to detect Tuberculosis (TB) from chest X-ray images using a Convolutional Neural Network (CNN) built with PyTorch. Includes a FastAPI REST API and a simple HTML/CSS/JS frontend for uploading X-ray images and displaying real-time predictions with high accuracy.",
      technologies: ["PyTorch", "CNN", "FastAPI", "Deep Learning", "Medical AI"],
      githubUrl: "https://github.com/dabster108/Tuberculosis-X-ray-Prediction",
      liveUrl: "https://github.com/dabster108/Tuberculosis-X-ray-Prediction#demo",
      image: "/images/tuberclosis.png",
      icon: <Brain className="w-5 h-5" />,
      featured: true
    },
    {
      id: 3,
      title: "FuturePath Finder",
      description: "A career recommendation system that uses a Random Forest Classifier to analyze student data and suggest potential career paths. Features data cleaning & preprocessing, feature importance analysis, and FastAPI-based web interface for seamless interaction.",
      technologies: ["Python", "Random Forest", "FastAPI", "Machine Learning", "Data Science"],
      githubUrl: "https://github.com/dabster108/FuturePathFinder",
      liveUrl: "https://github.com/dabster108/FuturePathFinder#usage",
      image: "/images/carrer.png",
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 4,
      title: "Keywi Marketers",
      description: "A professional website developed with my friend Pratik Joshi for Keywi Marketers, a digital advertising company. Built using JavaScript, Node.js, and Tailwind CSS, focusing on performance, responsiveness, and a clean UI/UX design.",
      technologies: ["JavaScript", "Node.js", "Tailwind CSS", "Web Development", "UI/UX"],
      githubUrl: "https://github.com/dabster108/KEYWI-MARKETERS",
      liveUrl: "https://keywi-marketers.netlify.app",
      image: "/images/marketers.png",
      icon: <ExternalLink className="w-5 h-5" />
    },
    {
      id: 5,
      title: "Code Sika",
      description: "A software development project built with Gradle, showcasing structured source code aimed at solving specific programming tasks and larger applications. Demonstrates clean architecture and modern development practices.",
      technologies: ["Java", "Gradle", "Software Engineering", "Clean Code", "Architecture"],
      githubUrl: "https://github.com/dabster108/CodeSika",
      liveUrl: "https://github.com/dabster108/CodeSika#features",
      image: "/images/codesika.png",
      icon: <Code className="w-5 h-5" />
    },
    {
      id: 6,
      title: "Spotify Hybrid Recommender",
      description: "An advanced music recommendation system that combines collaborative filtering and content-based filtering techniques. Uses Spotify API data to analyze user preferences and music features to provide personalized song recommendations with high accuracy.",
      technologies: ["Python", "Machine Learning", "Spotify API", "Collaborative Filtering", "Data Science"],
      githubUrl: "https://github.com/dabster108/Spotify-Hybrid-Recommender-",
      liveUrl: "https://github.com/dabster108/Spotify-Hybrid-Recommender-#demo",
      image: "/images/student.png",
      icon: <Music className="w-5 h-5" />
    }
  ];

  const { setItemRef, visibleItems } = usePerItemFadeOnScroll(projects.length, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

  return (
    <section id="projects" className="relative py-32 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-accent/10" />
      
      {/* Floating Gradient Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-500/15 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse opacity-25" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/6 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-primary/15 rounded-full blur-2xl animate-pulse opacity-20" style={{ animationDelay: "4s" }} />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Elegant Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-8">
              <Code className="w-4 h-4" />
              Portfolio Showcase
            </div>
            
            <h2 className="font-heading text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Featured Projects
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A curated selection of my work spanning AI/ML, web development, mobile apps, and innovative solutions that solve real-world problems.
            </p>
          </div>

          {/* Premium Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                ref={setItemRef(index)}
                className={`group relative transition-all duration-700 transform ${
                  visibleItems[index]
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-12 scale-95'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Featured Project Subtle Border */}
                {project.featured && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl opacity-30 group-hover:opacity-60 transition-all duration-700 blur-sm" />
                )}
                
                {/* Hover Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />

                <Card className={`relative h-full overflow-hidden bg-card/60 backdrop-blur-xl border transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2 ${
                  project.featured 
                    ? 'border-primary/40 shadow-2xl shadow-primary/15' 
                    : 'border-border/50 shadow-lg'
                } rounded-2xl`}>
                  
                  {/* Quick GitHub Link - Bottom Right */}
                  <button
                    onClick={() => window.open(project.githubUrl, '_blank')}
                    className="absolute bottom-4 right-4 z-20 p-2 bg-background/80 backdrop-blur-sm rounded-full border border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 hover:scale-110"
                    aria-label="View on GitHub"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  </button>
                  
                  {/* Featured Ribbon */}
                  {project.featured && (
                    <div className="absolute top-4 right-4 z-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-sm opacity-40" />
                        <Badge className="relative bg-gradient-to-r from-primary to-purple-500 text-primary-foreground border-0 text-xs font-semibold shadow-lg">
                          ⭐ Featured
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Premium Image Container */}
                  <div className="relative overflow-hidden h-56">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Floating Project Icon */}
                    <div className="absolute top-6 left-6 p-3 bg-background/90 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10">
                      {project.icon}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8 flex flex-col h-full">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="font-heading text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                        {project.title}
                      </CardTitle>
                      
                      <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {project.description.length > 140 
                          ? project.description.substring(0, 140) + "..." 
                          : project.description}
                      </CardDescription>
                    </CardHeader>

                    {/* Tech Stack */}
                    <div className="mb-6 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <Badge 
                            key={tech} 
                            variant="secondary" 
                            className="text-xs px-3 py-1 bg-muted/50 hover:bg-primary/10 border border-border/30 rounded-full font-medium transition-colors duration-200"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 4 && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-3 py-1 bg-muted/30 border border-border/30 rounded-full"
                          >
                            +{project.technologies.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <CardContent className="p-0 mt-auto">
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 h-10 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                          onClick={() => window.open(project.githubUrl, '_blank')}
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </Button>
                        
                        <Button 
                          size="sm" 
                          className="flex-1 h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/20 transition-all duration-300"
                          onClick={() => window.open(project.githubUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-20">
            <div className="inline-flex flex-col items-center gap-6">
              <p className="text-muted-foreground text-lg">
                Interested in seeing more of my work?
              </p>
              
              <Button 
                size="lg" 
                className="h-14 px-8 bg-gradient-to-r from-primary via-primary to-purple-600 hover:from-primary/90 hover:via-primary/90 hover:to-purple-600/90 shadow-2xl hover:shadow-primary/25 transition-all duration-500 text-lg font-semibold"
                onClick={() => window.open('https://github.com/dabster108', '_blank')}
              >
                <Github className="w-5 h-5 mr-3" />
                Explore All Projects
                <ExternalLink className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;