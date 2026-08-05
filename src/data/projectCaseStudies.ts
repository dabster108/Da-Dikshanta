import type { SilhouetteKey } from "@/three/silhouettes";

/**
 * Case-study content per project. Drawn from the existing portfolio copy
 * (ProjectsSection.tsx + projectActivations.ts). Where a section would need
 * a number or a decision I don't have on record, it says so as a placeholder
 * — nothing invented, no fake metrics.
 */

export interface CaseStudySection {
  id: string;
  label: string;
  body: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  silhouette: SilhouetteKey;
  githubUrl: string;
  liveUrl: string;
  image: string;
  role: string;
  sections: CaseStudySection[];
  /** Which interactive demo to mount. See ProjectDemo.tsx. */
  demo: "tb-heatmap" | "decision-tree" | "recommender-graph" | "none";
  tech: string[];
}

const placeholder = (label: string) =>
  `[${label} — placeholder: not documented. To be filled from project notes.]`;

export const CASE_STUDIES: Record<string, CaseStudy> = {
  "daktar-saab": {
    id: "daktar-saab",
    title: "Daktar Saab",
    silhouette: "medical-cross",
    githubUrl: "https://github.com/dabster108/DaktarSaab",
    liveUrl: "https://github.com/dabster108/DaktarSaab/releases",
    image: "/images/doctor.png",
    role: "AI-powered mobile healthcare companion (Kotlin + Firebase).",
    demo: "none",
    tech: ["Kotlin", "Firebase", "AI/ML", "Mobile", "Healthcare"],
    sections: [
      {
        id: "problem",
        label: "Problem",
        body: "Patients managing chronic conditions juggle symptom checking, X-ray analysis, appointment booking, hospital navigation, medication reminders, and mental-health resources — each in a different app. Daktar Saab pulls those into one mobile companion.",
      },
      {
        id: "approach",
        label: "Approach",
        body: "A Kotlin mobile front-end over Firebase, with AI features (symptom checking, X-ray analysis) layered in. The hard part isn't the model — it's making a dozen health features feel like one calm app.",
      },
      {
        id: "architecture",
        label: "Architecture",
        body: `Kotlin app ↔ Firebase (auth, realtime DB, storage) ↔ AI services. On-device inference for lightweight features, cloud models for image analysis. ${placeholder("Architecture diagram")}`,
      },
      {
        id: "decisions",
        label: "Key decisions",
        body: placeholder("Specific architecture decisions"),
      },
      {
        id: "result",
        label: "Result",
        body: `A working mobile healthcare companion with AI symptom checking, X-ray analysis, appointment booking, hospital navigation, medication reminders, and mental-health resources. ${placeholder("Usage metrics")}`,
      },
      {
        id: "lessons",
        label: "Lessons",
        body: placeholder("Lessons learned"),
      },
    ],
  },

  "tb-classifier": {
    id: "tb-classifier",
    title: "Tuberculosis X-ray Prediction",
    silhouette: "lungs",
    githubUrl: "https://github.com/dabster108/Tuberculosis-X-ray-Prediction",
    liveUrl: "https://github.com/dabster108/Tuberculosis-X-ray-Prediction#demo",
    image: "/images/tuberclosis.png",
    role: "TB detection from chest X-rays — CNN (PyTorch) served via FastAPI.",
    demo: "tb-heatmap",
    tech: ["PyTorch", "CNN", "FastAPI", "Deep Learning", "Medical AI"],
    sections: [
      {
        id: "problem",
        label: "Problem",
        body: "Tuberculosis is detectable from chest X-rays, but reading them requires a radiologist. A CNN that flags likely-TB X-rays can pre-screen at scale — if it's accurate enough to trust.",
      },
      {
        id: "approach",
        label: "Approach",
        body: "A convolutional neural network in PyTorch trained on chest X-ray images, exposed through a FastAPI REST endpoint, with a minimal HTML/CSS/JS front-end for uploading an image and showing the prediction in real time.",
      },
      {
        id: "architecture",
        label: "Architecture",
        body: "Browser → FastAPI → PyTorch model → prediction + confidence. The model is the center; the API and the front-end exist to make it something a clinician could actually hand to a patient.",
      },
      {
        id: "decisions",
        label: "Key decisions",
        body: placeholder("Specific model architecture and training decisions"),
      },
      {
        id: "result",
        label: "Result",
        body: `A working X-ray → TB-prediction pipeline with a FastAPI backend and a front-end UI. The demo below is an illustrative activation heatmap, not a real inference. ${placeholder("Accuracy / sensitivity / specificity")}`,
      },
      {
        id: "lessons",
        label: "Lessons",
        body: placeholder("Lessons learned"),
      },
    ],
  },

  "futurepath-finder": {
    id: "futurepath-finder",
    title: "FuturePath Finder",
    silhouette: "decision-tree",
    githubUrl: "https://github.com/dabster108/FuturePathFinder",
    liveUrl: "https://github.com/dabster108/FuturePathFinder#usage",
    image: "/images/carrer.png",
    role: "Career recommendation — Random Forest (Python) + FastAPI.",
    demo: "decision-tree",
    tech: ["Python", "Random Forest", "FastAPI", "Machine Learning", "Data Science"],
    sections: [
      {
        id: "problem",
        label: "Problem",
        body: "Students choosing a career path have few signals and a lot of noise. A model that maps a student's profile to likely-fit careers can narrow the search.",
      },
      {
        id: "approach",
        label: "Approach",
        body: "A Random Forest Classifier over student data, with data cleaning and preprocessing, feature-importance analysis to explain which inputs matter, and a FastAPI web interface for interaction.",
      },
      {
        id: "architecture",
        label: "Architecture",
        body: "FastAPI → Random Forest (sklearn) → ranked career suggestions + feature importances. The importances are first-class output, not a debug tool — they're how a student learns why the model said what it said.",
      },
      {
        id: "decisions",
        label: "Key decisions",
        body: placeholder("Specific feature engineering and model selection decisions"),
      },
      {
        id: "result",
        label: "Result",
        body: `A career-recommendation system with a FastAPI interface and feature-importance analysis. The demo below is an illustrative decision path, not a real inference. ${placeholder("Accuracy")}`,
      },
      {
        id: "lessons",
        label: "Lessons",
        body: placeholder("Lessons learned"),
      },
    ],
  },

  "keywi-marketers": {
    id: "keywi-marketers",
    title: "Keywi Marketers",
    silhouette: "growth-bars",
    githubUrl: "https://github.com/dabster108/KEYWI-MARKETERS",
    liveUrl: "https://keywi-marketers.netlify.app",
    image: "/images/marketers.png",
    role: "Marketing website for a digital advertising company (JS + Node + Tailwind).",
    demo: "none",
    tech: ["JavaScript", "Node.js", "Tailwind CSS", "Web Development", "UI/UX"],
    sections: [
      {
        id: "problem",
        label: "Problem",
        body: "A digital advertising company needed a professional web presence that loaded fast and read well on mobile — the kind of work that's easy to underestimate.",
      },
      {
        id: "approach",
        label: "Approach",
        body: "Built with my friend Pratik Joshi using JavaScript, Node.js, and Tailwind CSS, focused on performance, responsiveness, and a clean UI/UX.",
      },
      {
        id: "architecture",
        label: "Architecture",
        body: `Node.js-served static site, Tailwind for styling, deployed to Netlify. ${placeholder("Detailed architecture")}`,
      },
      {
        id: "decisions",
        label: "Key decisions",
        body: placeholder("Specific design and performance decisions"),
      },
      {
        id: "result",
        label: "Result",
        body: `A live marketing site at keywi-marketers.netlify.app. ${placeholder("Performance metrics")}`,
      },
      {
        id: "lessons",
        label: "Lessons",
        body: placeholder("Lessons learned"),
      },
    ],
  },

  "code-sika": {
    id: "code-sika",
    title: "Code Sika",
    silhouette: "brackets",
    githubUrl: "https://github.com/dabster108/CodeSika",
    liveUrl: "https://github.com/dabster108/CodeSika#features",
    image: "/images/codesika.png",
    role: "Software engineering project — Java/Gradle, clean architecture.",
    demo: "none",
    tech: ["Java", "Gradle", "Software Engineering", "Clean Code", "Architecture"],
    sections: [
      {
        id: "problem",
        label: "Problem",
        body: "A software development project aimed at solving specific programming tasks and larger applications, with structured source code and modern development practices.",
      },
      {
        id: "approach",
        label: "Approach",
        body: "Java built with Gradle, structured around clean architecture and modern development practices — the kind of project where the discipline is the point.",
      },
      {
        id: "architecture",
        label: "Architecture",
        body: `Gradle build, layered source organization. ${placeholder("Detailed layer breakdown")}`,
      },
      {
        id: "decisions",
        label: "Key decisions",
        body: placeholder("Specific architecture decisions"),
      },
      {
        id: "result",
        label: "Result",
        body: `A structured Java/Gradle project demonstrating clean architecture. ${placeholder("Outcome metrics")}`,
      },
      {
        id: "lessons",
        label: "Lessons",
        body: placeholder("Lessons learned"),
      },
    ],
  },

  "spotify-recommender": {
    id: "spotify-recommender",
    title: "Spotify Hybrid Recommender",
    silhouette: "music-note",
    githubUrl: "https://github.com/dabster108/Spotify-Hybrid-Recommender-",
    liveUrl: "https://github.com/dabster108/Spotify-Hybrid-Recommender-#demo",
    image: "/images/student.png",
    role: "Hybrid music recommender — collaborative + content filtering (Python).",
    demo: "recommender-graph",
    tech: ["Python", "Machine Learning", "Spotify API", "Collaborative Filtering", "Data Science"],
    sections: [
      {
        id: "problem",
        label: "Problem",
        body: "Pure collaborative filtering suffers from cold-start; pure content-based filtering gets stuck in a genre rut. A hybrid recommender can borrow each method's strengths.",
      },
      {
        id: "approach",
        label: "Approach",
        body: "Combines collaborative filtering and content-based filtering using Spotify API data — analyzing user preferences and track features to produce personalized recommendations.",
      },
      {
        id: "architecture",
        label: "Architecture",
        body: `Spotify API → feature extraction → collaborative model + content model → hybrid ranking. ${placeholder("Detailed model design")}`,
      },
      {
        id: "decisions",
        label: "Key decisions",
        body: placeholder("Specific hybrid weighting and feature decisions"),
      },
      {
        id: "result",
        label: "Result",
        body: `A hybrid recommender producing personalized song recommendations. The demo below is an illustrative similarity graph, not a real inference. ${placeholder("Accuracy / coverage")}`,
      },
      {
        id: "lessons",
        label: "Lessons",
        body: placeholder("Lessons learned"),
      },
    ],
  },
};
