import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Github,
  Brain,
  Heart,
  Users,
  Code,
  Music,
} from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { usePerItemFadeOnScroll } from "@/hooks/use-scroll-animation";
import ChargeablePanel from "@/components/effects/ChargeablePanel";
import { PROJECT_ACTIVATIONS } from "@/data/projectActivations";

const ProjectsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardAnchorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardAnchorPoints = useRef<{ x: number; y: number }[]>([]);
  const projects = [
    {
      id: 1,
      title: "Daktar Saab",
      description:
        "An AI-powered mobile healthcare application built with Kotlin and Firebase. It helps patients manage their health efficiently with features like AI symptom checking, X-ray analysis, appointment booking, and hospital navigation. From mental health resources to medication reminders, Daktar Saab is your personal digital health assistant.",
      technologies: [
        "Kotlin",
        "Firebase",
        "AI/ML",
        "Mobile Development",
        "Healthcare",
      ],
      githubUrl: "https://github.com/dabster108/DaktarSaab",
      liveUrl: "https://github.com/dabster108/DaktarSaab/releases",
      image: "/images/doctor.png",
      icon: <Heart className="w-5 h-5" />,
      featured: true,
    },
    {
      id: 2,
      title: "Tuberculosis X-ray Prediction",
      description:
        "A deep learning project to detect Tuberculosis (TB) from chest X-ray images using a Convolutional Neural Network (CNN) built with PyTorch. Includes a FastAPI REST API and a simple HTML/CSS/JS frontend for uploading X-ray images and displaying real-time predictions with high accuracy.",
      technologies: [
        "PyTorch",
        "CNN",
        "FastAPI",
        "Deep Learning",
        "Medical AI",
      ],
      githubUrl: "https://github.com/dabster108/Tuberculosis-X-ray-Prediction",
      liveUrl:
        "https://github.com/dabster108/Tuberculosis-X-ray-Prediction#demo",
      image: "/images/tuberclosis.png",
      icon: <Brain className="w-5 h-5" />,
      featured: true,
    },
    {
      id: 3,
      title: "FuturePath Finder",
      description:
        "A career recommendation system that uses a Random Forest Classifier to analyze student data and suggest potential career paths. Features data cleaning & preprocessing, feature importance analysis, and FastAPI-based web interface for seamless interaction.",
      technologies: [
        "Python",
        "Random Forest",
        "FastAPI",
        "Machine Learning",
        "Data Science",
      ],
      githubUrl: "https://github.com/dabster108/FuturePathFinder",
      liveUrl: "https://github.com/dabster108/FuturePathFinder#usage",
      image: "/images/carrer.png",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 4,
      title: "Keywi Marketers",
      description:
        "A professional website developed with my friend Pratik Joshi for Keywi Marketers, a digital advertising company. Built using JavaScript, Node.js, and Tailwind CSS, focusing on performance, responsiveness, and a clean UI/UX design.",
      technologies: [
        "JavaScript",
        "Node.js",
        "Tailwind CSS",
        "Web Development",
        "UI/UX",
      ],
      githubUrl: "https://github.com/dabster108/KEYWI-MARKETERS",
      liveUrl: "https://keywi-marketers.netlify.app",
      image: "/images/marketers.png",
      icon: <ExternalLink className="w-5 h-5" />,
    },
    {
      id: 5,
      title: "Code Sika",
      description:
        "A software development project built with Gradle, showcasing structured source code aimed at solving specific programming tasks and larger applications. Demonstrates clean architecture and modern development practices.",
      technologies: [
        "Java",
        "Gradle",
        "Software Engineering",
        "Clean Code",
        "Architecture",
      ],
      githubUrl: "https://github.com/dabster108/CodeSika",
      liveUrl: "https://github.com/dabster108/CodeSika#features",
      image: "/images/codesika.png",
      icon: <Code className="w-5 h-5" />,
    },
    {
      id: 6,
      title: "Spotify Hybrid Recommender",
      description:
        "An advanced music recommendation system that combines collaborative filtering and content-based filtering techniques. Uses Spotify API data to analyze user preferences and music features to provide personalized song recommendations with high accuracy.",
      technologies: [
        "Python",
        "Machine Learning",
        "Spotify API",
        "Collaborative Filtering",
        "Data Science",
      ],
      githubUrl: "https://github.com/dabster108/Spotify-Hybrid-Recommender-",
      liveUrl: "https://github.com/dabster108/Spotify-Hybrid-Recommender-#demo",
      image: "/images/student.png",
      icon: <Music className="w-5 h-5" />,
    },
  ];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.25"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.35,
  });
  const timelineProgressTop = useTransform(
    smoothProgress,
    (v) => `${Math.max(0.01, Math.min(0.99, v)) * 100}%`,
  );
  const timelineProgressHeight = useTransform(
    smoothProgress,
    (v) => `${Math.max(0.03, Math.min(1, v)) * 100}%`,
  );
  const bubbleX = useMotionValue(0);
  const bubbleY = useMotionValue(0);
  const { setItemRef, visibleItems } = usePerItemFadeOnScroll(projects.length, {
    threshold: 0.25,
    rootMargin: "-10% 0px -15% 0px",
  });

  useEffect(() => {
    const measureCardAnchors = () => {
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      const sectionRect = sectionEl.getBoundingClientRect();
      const points = cardAnchorRefs.current
        .map((el) => {
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left - sectionRect.left + rect.width / 2,
            y: rect.top - sectionRect.top + rect.height / 2,
          };
        })
        .filter((point): point is { x: number; y: number } => point !== null);

      cardAnchorPoints.current = points;
      if (points.length > 0) {
        bubbleX.set(points[0].x);
        bubbleY.set(points[0].y);
      }
    };

    measureCardAnchors();
    window.addEventListener("resize", measureCardAnchors);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measureCardAnchors())
        : null;

    if (resizeObserver && sectionRef.current) {
      resizeObserver.observe(sectionRef.current);
    }

    return () => {
      window.removeEventListener("resize", measureCardAnchors);
      resizeObserver?.disconnect();
    };
  }, [bubbleX, bubbleY]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const points = cardAnchorPoints.current;
    if (points.length === 0) return;
    if (points.length === 1) {
      bubbleX.set(points[0].x);
      bubbleY.set(points[0].y);
      return;
    }

    const clamped = Math.max(0, Math.min(1, latest));
    const segment = clamped * (points.length - 1);
    const lowerIndex = Math.floor(segment);
    const upperIndex = Math.min(points.length - 1, lowerIndex + 1);
    const t = segment - lowerIndex;
    const start = points[lowerIndex];
    const end = points[upperIndex];

    bubbleX.set(start.x + (end.x - start.x) * t);
    bubbleY.set(start.y + (end.y - start.y) * t);
  });

  return (
    <section
      id="projects"
      data-scroll-section
      className="relative py-32 overflow-hidden"
    >
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/55 via-background/35 to-accent/10" />

      {/* Floating Gradient Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse opacity-30" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-500/15 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse opacity-25"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/6 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-primary/15 rounded-full blur-2xl animate-pulse opacity-20"
          style={{ animationDelay: "4s" }}
        />
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
              A curated selection of my work spanning AI/ML, web development,
              mobile apps, and innovative solutions that solve real-world
              problems.
            </p>
          </div>

          {/* Premium Projects Timeline Layout */}
          <div ref={sectionRef} className="relative mt-20 max-w-6xl mx-auto">
            <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/35 via-purple-500/35 to-primary/35 rounded-full md:-translate-x-1/2" />
            <motion.div
              className="absolute left-[39px] md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-primary/80 via-purple-400/85 to-primary/80 rounded-full md:-translate-x-1/2"
              style={{ height: timelineProgressHeight }}
            />
            <motion.div
              className="absolute left-[39px] md:left-1/2 z-30 w-4 h-4 rounded-full md:-translate-x-1/2 -translate-y-1/2 bg-primary border border-white/35 shadow-[0_0_14px_rgba(168,85,247,0.8)]"
              style={{ top: timelineProgressTop }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute z-0 pointer-events-none w-[300px] h-[300px] rounded-full -translate-x-1/2 -translate-y-1/2 border border-blue-300/35 bg-[radial-gradient(circle_at_35%_35%,rgba(191,219,254,0.58)_0%,rgba(96,165,250,0.34)_42%,rgba(59,130,246,0.2)_68%,rgba(59,130,246,0)_100%)] shadow-[0_0_30px_rgba(59,130,246,0.28)]"
              style={{ left: bubbleX, top: bubbleY }}
              animate={{ scale: [1, 1.045, 1], opacity: [0.22, 0.4, 0.22] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="flex flex-col gap-16 md:gap-32">
              {projects.map((project, index) => {
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={project.id}
                    ref={setItemRef(index)}
                    className="relative z-10 flex flex-col md:flex-row items-center w-full group transition-all duration-1000 transform opacity-100 translate-y-0"
                    initial={false}
                    animate={
                      visibleItems[index]
                        ? { opacity: 1, y: 0, x: 0, scale: 1 }
                        : {
                            opacity: 0,
                            y: 36,
                            x: isEven ? -72 : 72,
                            scale: 0.97,
                          }
                    }
                    transition={{
                      duration: 0.58,
                      delay: Math.min(index * 0.08, 0.24),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      transitionDelay: `${Math.min(index * 150, 400)}ms`,
                    }}
                  >
                    {/* Card Container */}
                    <div
                      ref={(el) => {
                        cardAnchorRefs.current[index] = el;
                      }}
                      className={`w-full md:w-[43%] pl-[76px] md:pl-0 ${isEven ? "md:pr-12 md:mr-auto" : "md:pl-12 md:ml-auto"}`}
                    >
                      <ChargeablePanel
                        id={
                          PROJECT_ACTIVATIONS[index]?.id ?? `project-${index}`
                        }
                        label={project.title}
                      >
                        {/* Interactive Glow Behind Card */}
                        <div
                          className={`absolute -inset-1 bg-gradient-to-r ${isEven ? "from-primary/20 via-purple-500/10 to-transparent" : "from-transparent via-purple-500/10 to-primary/20"} rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl font-light`}
                        />

                        <Card
                          className={`relative flex flex-col overflow-hidden bg-background/50 backdrop-blur-2xl border transition-all duration-500 group-hover:scale-[1.03] group-hover:-translate-y-3 ${
                            project.featured
                              ? "border-primary/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/20"
                              : "border-white/10 shadow-xl group-hover:shadow-primary/10 hover:border-white/20"
                          } rounded-[1.35rem] min-h-[330px] h-full`}
                        >
                          {/* Quick GitHub Link - Bottom Right */}
                          <button
                            onClick={() =>
                              window.open(project.githubUrl, "_blank")
                            }
                            className="absolute bottom-4 right-4 z-30 p-2.5 bg-background/80 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/20 hover:border-primary/50 hover:scale-110 shadow-lg"
                            aria-label="View on GitHub"
                          >
                            <ExternalLink className="w-4 h-4 text-foreground/80 hover:text-primary transition-colors" />
                          </button>

                          {/* Featured Ribbon */}
                          {project.featured && (
                            <div className="absolute top-4 right-4 z-30">
                              <div className="relative group/badge">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-md opacity-60 group-hover/badge:opacity-100 transition-opacity duration-300" />
                                <Badge className="relative bg-gradient-to-r from-primary to-purple-500 text-primary-foreground border-0 text-xs font-bold tracking-wide shadow-xl py-1 px-3">
                                  ⭐ FEATURED
                                </Badge>
                              </div>
                            </div>
                          )}

                          {/* Premium Image Container */}
                          <div className="relative overflow-hidden aspect-[16/10] w-full">
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />

                            {/* Rich Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
                            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            {/* Floating Project Icon */}
                            <div className="absolute top-6 left-6 p-3.5 bg-background/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-primary/20 group-hover:border-primary/30 z-20">
                              {project.icon}
                            </div>
                          </div>

                          {/* Card Content - Overlapping the image slightly */}
                          <div className="p-6 pt-5 flex flex-col flex-grow w-full relative z-10 -mt-8 bg-gradient-to-b from-transparent via-background/90 to-background backdrop-blur-sm rounded-b-[1.35rem]">
                            <CardHeader className="p-0 mb-4">
                              <CardTitle className="font-heading text-2xl font-bold tracking-tight mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-primary transition-all duration-300">
                                {project.title}
                              </CardTitle>

                              <CardDescription className="text-sm text-muted-foreground/90 leading-relaxed font-light line-clamp-4">
                                {project.description}
                              </CardDescription>
                            </CardHeader>

                            {/* Tech Stack */}
                            <div className="mb-6 flex-1">
                              <div className="flex flex-wrap gap-2">
                                {project.technologies
                                  .slice(0, 5)
                                  .map((tech) => (
                                    <span
                                      key={tech}
                                      className="text-[11px] px-2.5 py-1 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 rounded-full font-medium transition-all duration-300 text-foreground/80 hover:text-foreground"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                {project.technologies.length > 5 && (
                                  <span className="text-[11px] px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-foreground/70">
                                    +{project.technologies.length - 5}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <CardContent className="p-0 mt-auto">
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  className="flex-1 h-10 border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 font-medium group/btn"
                                  onClick={() =>
                                    window.open(project.githubUrl, "_blank")
                                  }
                                >
                                  <Github className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                                  Source Code
                                </Button>

                                <Button
                                  className="flex-1 h-10 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 shadow-xl hover:shadow-primary/25 transition-all duration-300 font-medium border-0 group/btn2"
                                  onClick={() =>
                                    window.open(project.liveUrl, "_blank")
                                  }
                                >
                                  <ExternalLink className="w-4 h-4 mr-2 group-hover/btn2:rotate-12 transition-transform" />
                                  Live Demo
                                </Button>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </ChargeablePanel>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
                onClick={() =>
                  window.open("https://github.com/dabster108", "_blank")
                }
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
