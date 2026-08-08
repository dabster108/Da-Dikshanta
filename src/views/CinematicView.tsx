import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/motion/useLenis";
import { CursorSpotlight } from "@/motion/primitives";
import { Preloader } from "@/components/cinematic/Preloader";
import { NeuralBackground } from "@/components/cinematic/NeuralBackground";
import { LandingSection } from "@/components/cinematic/LandingSection";
import { AboutSection } from "@/components/cinematic/AboutSection";
import { StatsSection } from "@/components/cinematic/StatsSection";
import { ResearchJourneySection } from "@/components/cinematic/ResearchJourneySection";
import { ProjectsSection, type Project } from "@/components/cinematic/ProjectsSection";
import { AILabSection } from "@/components/cinematic/AILabSection";
import { LabDemosSection } from "@/components/cinematic/LabDemosSection";
import { SkillsSection } from "@/components/cinematic/SkillsSection";
import { TimelineSection } from "@/components/cinematic/TimelineSection";
import { PresenceSection } from "@/components/cinematic/PresenceSection";
import { ContactSection } from "@/components/cinematic/ContactSection";

const PROJECTS: Project[] = [
  {
    id: "cv",
    index: "01",
    title: "Computer Vision",
    tagline: "Perception pipelines that run in the real world.",
    body: "Detection, tracking, and segmentation systems deployed on edge hardware — built to survive lighting changes, motion blur, and the gap between benchmark and field.",
    stack: ["PyTorch", "OpenCV", "TensorRT", "CUDA"],
    metric: { label: "latency", value: "32 ms" },
  },
  {
    id: "vr",
    index: "02",
    title: "VR / Spatial",
    tagline: "Interfaces that respect the body.",
    body: "Spatial interaction research — low-latency tracking, comfort-first rendering, and the small physics details that make a virtual space feel inhabited instead of displayed.",
    stack: ["Three.js", "WebXR", "TypeScript"],
    metric: { label: "motion-to-photon", value: "11 ms" },
  },
  {
    id: "crypto",
    index: "03",
    title: "Cryptography",
    tagline: "Correctness under adversarial pressure.",
    body: "Applied cryptography work — protocol design, implementation review, and the unglamorous engineering that keeps a system confidential and integrity-bound when someone is actively trying to break it.",
    stack: ["Python", "Rust", "OpenSSL"],
    metric: { label: "audit findings", value: "0 critical" },
  },
  {
    id: "fraud",
    index: "04",
    title: "Fraud Detection",
    tagline: "Signal at thousands of events per second.",
    body: "Real-time fraud scoring on a streaming event pipeline — feature engineering under drift, calibrated probabilities, and a feedback loop that turns investigator decisions back into training signal.",
    stack: ["TensorFlow", "Kafka", "Docker", "Redis"],
    metric: { label: "recall @ precision", value: "0.91" },
  },
  {
    id: "agents",
    index: "05",
    title: "Multi-Agent Systems",
    tagline: "Behaviour from the protocol, not the node.",
    body: "Systems where several agents coordinate to solve something none of them could alone — message-passing architectures, tool use, and surfacing the reasoning so a human can audit what happened and why.",
    stack: ["Python", "LangGraph", "PyTorch"],
    metric: { label: "tasks solved", value: "87%" },
  },
  {
    id: "portfolio",
    index: "06",
    title: "This Portfolio",
    tagline: "The work is the demo.",
    body: "The site you're reading is itself a research artifact — a scroll-driven engine that translates a reference motion system into an AI research narrative, with the six underlying mechanics documented and reproducible.",
    stack: ["React", "GSAP", "Lenis", "Three.js"],
    metric: { label: "mechanics", value: "6 / 6" },
  },
];

/**
 * CinematicView — the single-page scroll-driven portfolio. Composes the six
 * motion mechanics across nine sections, with Lenis smooth scroll wired into
 * GSAP ScrollTrigger. The neural background dims to near-zero as the contact
 * section enters, so the page decelerates at the end.
 */
export const CinematicView = () => {
  const [booting, setBooting] = useState(true);
  const bgRef = useRef<HTMLDivElement>(null);
  useLenis();

  // Dim the neural background + spotlight when the contact section is in view.
  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!contact || !bgRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const dim = e.isIntersecting ? 0.15 : 1;
        bgRef.current!.style.opacity = String(dim);
      },
      { threshold: 0.2 },
    );
    io.observe(contact);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {booting && <Preloader onComplete={() => setBooting(false)} />}

      <div ref={bgRef} style={{ transition: "opacity 1.2s ease" }}>
        <NeuralBackground />
      </div>
      <CursorSpotlight />

      <div className="relative z-10">
        <LandingSection />
        <AboutSection />
        <StatsSection />
        <ResearchJourneySection />
        <ProjectsSection projects={PROJECTS} />
        <AILabSection />
        <LabDemosSection />
        <SkillsSection />
        <TimelineSection />
        <PresenceSection />
        <ContactSection />
      </div>
    </>
  );
};

export default CinematicView;
