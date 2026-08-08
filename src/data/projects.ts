/**
 * Shipped work — the single source of truth for every project surface.
 *
 * Nothing in this file is invented. Every project is real, links to its own
 * source, and describes only what was actually built. Where a number would
 * be needed to make a claim — accuracy, users, latency, throughput — and
 * there is no verified figure on record, the claim is not made and the
 * field is omitted. There is deliberately no `metrics` data: none of these
 * projects has a published benchmark I can point at.
 *
 * `architecture.stages` is the real data path through each system, so the
 * animated pipeline diagram teaches the system instead of just moving.
 */

export interface ArchitectureStage {
  /** Short label rendered in the node. */
  label: string;
  /** One clause explaining what happens here. Shown on hover/focus. */
  detail: string;
  /** Marks the stage where the actual intelligence lives. */
  core?: boolean;
}

export interface Architecture {
  /** One sentence describing the shape of the system as a whole. */
  summary: string;
  stages: ArchitectureStage[];
}

export interface CaseSection {
  label: string;
  body: string;
}

export interface Project {
  id: string;
  /** Chapter number, rendered as the large index. */
  number: string;
  slug: string;
  title: string;
  /** Used by the chapter selector and the nav, where the full title won't fit. */
  shortTitle: string;
  category: string;
  year: string;
  /** One line, present tense, says what the system does. */
  description: string;
  /** The editorial line for the chapter opener — the argument, not the summary. */
  statement: string;
  problem: string;
  solution: string;
  architecture: Architecture;
  /** What I took from it. Kept honest: trade-offs, not victories. */
  lessons: string;
  role: string;
  technologies: string[];
  images: string[];
  github: string;
  demo?: string;
  featured: boolean;
  /** Chapter ground colour — ScrollController interpolates the page to this. */
  color: string;
  /** The model at the centre of the system, where there is one. */
  model?: string;
  /** Verified technical facts. Each maps to something in the source. */
  highlights: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "tb-classifier",
    number: "01",
    slug: "tuberculosis-xray",
    title: "Tuberculosis X-ray Prediction",
    shortTitle: "TB X-ray",
    category: "Computer Vision · Medical Imaging",
    year: "2025",
    description:
      "A convolutional network that reads chest X-rays and flags likely tuberculosis.",
    statement:
      "A model that pre-screens X-rays doesn't replace a radiologist. It changes who has to look at what.",
    problem:
      "Tuberculosis is visible in a chest X-ray, but reading one requires a radiologist. In places where radiologists are scarce, the bottleneck isn't diagnosis — it's triage. A model that can pre-screen X-rays and surface the likely-positive cases changes who has to look at what.",
    solution:
      "A convolutional neural network trained in PyTorch on chest X-ray images, exposed through a FastAPI endpoint, with a lightweight front-end that accepts an upload and returns a prediction with its confidence in real time.",
    architecture: {
      summary:
        "The model is the centre of the system; the API and the interface exist so that it is something a clinician could be handed rather than a notebook someone has to run.",
      stages: [
        { label: "X-ray", detail: "Image uploaded from the browser" },
        { label: "Preprocess", detail: "Normalised and resized to the model's input" },
        { label: "Convolution", detail: "Feature maps over the lung field", core: true },
        { label: "Features", detail: "Learned representation, pooled" },
        { label: "Classify", detail: "Prediction returned with its confidence" },
      ],
    },
    lessons:
      "Confidence is the hard part. A classifier that is 90% accurate and silent about which 10% it got wrong is not usable in a medical context. Most of the work after the training loop went into making uncertainty legible rather than into raising the headline number.",
    role: "Model, serving layer and interface",
    technologies: ["PyTorch", "CNN", "FastAPI", "Medical imaging", "Python"],
    images: ["/images/tuberclosis.png"],
    github: "https://github.com/dabster108/Tuberculosis-X-ray-Prediction",
    featured: true,
    color: "18 24 20",
    model: "Convolutional neural network",
    highlights: [
      "Trained in PyTorch on chest X-ray images",
      "Served over FastAPI, not left in a notebook",
      "Returns confidence alongside the label",
    ],
  },
  {
    id: "daktar-saab",
    number: "02",
    slug: "daktar-saab",
    title: "Daktar Saab",
    shortTitle: "Daktar Saab",
    category: "Applied AI · Mobile",
    year: "2025",
    description:
      "An AI healthcare companion that collapses a dozen health apps into one.",
    statement:
      "The fragmentation is the illness experience, not a UX detail.",
    problem:
      "Someone managing a chronic condition ends up with a symptom checker, an X-ray viewer, a booking app, hospital directions, a medication reminder and a mental-health resource — six apps, six accounts, no shared context. The fragmentation is the illness experience, not a UX detail.",
    solution:
      "A Kotlin Android application over Firebase for authentication, realtime data and storage, with AI features layered in: symptom checking, X-ray analysis, appointment booking, hospital navigation, medication reminders and mental-health resources.",
    architecture: {
      summary:
        "Lightweight inference runs on-device; image analysis goes to cloud models. The split is decided by latency tolerance, not by capability.",
      stages: [
        { label: "Symptom", detail: "Entered by the person using the app" },
        { label: "Triage", detail: "On-device inference where latency matters", core: true },
        { label: "Analysis", detail: "X-ray analysis routed to cloud models" },
        { label: "Guidance", detail: "Booking, navigation, reminders" },
        { label: "Follow-up", detail: "State persisted in Firebase across features" },
      ],
    },
    lessons:
      "The model was never the difficult part. Making twelve distinct health features feel like one calm application — one navigation model, one visual language, one sense of where you are — was where the engineering actually went.",
    role: "Mobile application and AI integration",
    technologies: ["Kotlin", "Firebase", "AI/ML", "Android", "Healthcare"],
    images: ["/images/doctor.png"],
    github: "https://github.com/dabster108/DaktarSaab",
    demo: "https://github.com/dabster108/DaktarSaab/releases",
    featured: true,
    color: "20 19 15",
    highlights: [
      "Kotlin Android client over Firebase auth, realtime DB and storage",
      "On-device inference for latency-sensitive paths, cloud for imaging",
      "Twelve health features under one navigation model",
    ],
  },
  {
    id: "futurepath-finder",
    number: "03",
    slug: "futurepath-finder",
    title: "FuturePath Finder",
    shortTitle: "FuturePath",
    category: "Machine Learning · Interpretability",
    year: "2025",
    description:
      "A career recommender that explains itself as clearly as it predicts.",
    statement:
      "For a system that advises a person about their own future, being auditable mattered more than the last few points of accuracy.",
    problem:
      "A student choosing a direction has very few real signals and a great deal of noise. A model that maps a profile onto plausible careers narrows the search — but only if the student can see why it said what it said.",
    solution:
      "A Random Forest classifier over student data, with cleaning and preprocessing up front and feature-importance analysis as a first-class output, served through a FastAPI interface.",
    architecture: {
      summary:
        "Feature importances are part of the response, not a debugging aid — they're the mechanism by which a student learns something rather than just being told something.",
      stages: [
        { label: "Profile", detail: "Student data in, cleaned and preprocessed" },
        { label: "Features", detail: "Encoded into the model's feature space" },
        { label: "Ensemble", detail: "Random Forest over decision trees", core: true },
        { label: "Ranking", detail: "Careers ordered by predicted fit" },
        { label: "Explanation", detail: "Per-feature importances returned with the ranking" },
      ],
    },
    lessons:
      "Choosing a random forest over a higher-ceiling model was a deliberate trade. An ensemble of trees is interrogable: you can follow a single decision path end to end. For a system whose entire purpose is to advise a person about their own future, being auditable mattered more than the last few points of accuracy.",
    role: "Model, feature analysis and API",
    technologies: ["Python", "Random Forest", "Scikit-learn", "FastAPI", "Data science"],
    images: ["/images/carrer.png"],
    github: "https://github.com/dabster108/FuturePathFinder",
    featured: true,
    color: "17 21 26",
    model: "Random Forest ensemble",
    highlights: [
      "Random Forest chosen for interrogability over ceiling",
      "Feature importances returned in the response, not logged",
      "Served through FastAPI",
    ],
  },
  {
    id: "spotify-recommender",
    number: "04",
    slug: "spotify-hybrid-recommender",
    title: "Spotify Hybrid Recommender",
    shortTitle: "Hybrid Recsys",
    category: "Machine Learning · Recommenders",
    year: "2025",
    description:
      "Collaborative and content-based filtering, combined to cover each other's blind spots.",
    statement:
      "Each method fails precisely where the other works. The blend weight is the dial between familiarity and discovery.",
    problem:
      "Collaborative filtering cannot recommend a track nobody has heard yet. Content-based filtering can, but it will happily trap a listener in a single genre forever. Each method fails precisely where the other works.",
    solution:
      "A hybrid over Spotify API data — collaborative signal from listening patterns, content signal from audio features — blended into a single ranking so that cold-start tracks stay reachable and recommendations keep some variety.",
    architecture: {
      summary:
        "Two models run in parallel and are blended into one ranking. The blend weight is the interesting parameter: it is the dial between familiarity and discovery.",
      stages: [
        { label: "Tracks", detail: "Pulled from the Spotify API" },
        { label: "Features", detail: "Audio features extracted per track" },
        { label: "Neighbours", detail: "Collaborative signal from listening patterns", core: true },
        { label: "Blend", detail: "Content and collaborative scores weighted together", core: true },
        { label: "Recommend", detail: "Single ranking out" },
      ],
    },
    lessons:
      "Recommendation quality is not a single number. A recommender optimised purely for predicted rating produces a list that is accurate and boring. Coverage and novelty had to be measured alongside accuracy or the model optimised itself into a rut.",
    role: "Model design and evaluation",
    technologies: ["Python", "Spotify API", "Collaborative filtering", "Pandas", "NumPy"],
    images: ["/images/student.png"],
    github: "https://github.com/dabster108/Spotify-Hybrid-Recommender-",
    featured: true,
    color: "19 17 24",
    model: "Hybrid collaborative + content",
    highlights: [
      "Collaborative and content models run in parallel, then blended",
      "Cold-start tracks stay reachable through the content path",
      "Coverage and novelty measured alongside accuracy",
    ],
  },
  {
    id: "code-sika",
    number: "05",
    slug: "code-sika",
    title: "Code Sika",
    shortTitle: "Code Sika",
    category: "Software Engineering · Architecture",
    year: "2024",
    description: "A Java codebase built as an argument for clean architecture.",
    statement:
      "The value of this project is not what it does. It's that adding to it six months later did not require reading all of it first.",
    problem:
      "Most projects reach a size where adding a feature costs more than the feature is worth. That point arrives earlier than anyone expects, and it arrives because of structure rather than volume.",
    solution:
      "A Java project built with Gradle and organised around clean architecture — the domain at the centre with no outward dependencies, use cases around it, adapters and interfaces at the edge where change is cheap.",
    architecture: {
      summary:
        "Dependencies point inward only: the domain layer does not know that a database or a user interface exists, which is what makes either one replaceable.",
      stages: [
        { label: "Domain", detail: "Entities and rules. No outward dependencies", core: true },
        { label: "Use cases", detail: "Application logic, depends only on the domain" },
        { label: "Adapters", detail: "Translation between use cases and the world" },
        { label: "Interface", detail: "Delivery mechanism at the replaceable edge" },
        { label: "Build", detail: "Gradle multi-stage build" },
      ],
    },
    lessons:
      "Discipline is the deliverable here. The value of this project is not what it does — it's that adding to it six months later did not require reading all of it first.",
    role: "Architecture and implementation",
    technologies: ["Java", "Gradle", "Clean architecture", "Testing", "OOP"],
    images: ["/images/codesika.png"],
    github: "https://github.com/dabster108/CodeSika",
    featured: false,
    color: "22 21 17",
    highlights: [
      "Domain layer with no outward dependencies",
      "Gradle multi-stage build",
      "Structure chosen so the edge stays replaceable",
    ],
  },
  {
    id: "keywi-marketers",
    number: "06",
    slug: "keywi-marketers",
    title: "Keywi Marketers",
    shortTitle: "Keywi",
    category: "Full Stack · Production",
    year: "2024",
    description: "A production marketing site for a digital advertising company.",
    statement:
      "Client work has a different definition of done. It is live, it is fast, and it belongs to someone else now.",
    problem:
      "An advertising company is judged on its own web presence before anyone reads a word of it. The site had to load quickly on a mid-range phone over a slow connection, because that is the actual condition most of its visitors arrive in.",
    solution:
      "Built with Pratik Joshi using JavaScript, Node.js and Tailwind CSS, with performance and responsiveness treated as design constraints from the first commit rather than as a pass at the end.",
    architecture: {
      summary:
        "Deliberately boring infrastructure — the interesting decisions were all about what to leave out.",
      stages: [
        { label: "Content", detail: "Copy and assets, budgeted for weight" },
        { label: "Layout", detail: "Tailwind, responsive from the first commit" },
        { label: "Build", detail: "Node-served static output", core: true },
        { label: "Deploy", detail: "Netlify behind a CDN" },
        { label: "Live", detail: "Serving a real client's traffic" },
      ],
    },
    lessons:
      "Client work has a different definition of done. The site is live, it is fast, and it belongs to someone else now — which is its own kind of engineering constraint.",
    role: "Front-end engineering, with Pratik Joshi",
    technologies: ["JavaScript", "Node.js", "Tailwind CSS", "Netlify", "UI/UX"],
    images: ["/images/marketers.png"],
    github: "https://github.com/dabster108/KEYWI-MARKETERS",
    demo: "https://keywi-marketers.netlify.app",
    featured: false,
    color: "20 22 18",
    highlights: [
      "Performance treated as a design constraint, not a final pass",
      "Node-served static site on Netlify behind a CDN",
      "Shipped to a client and handed over",
    ],
  },
];

export const FEATURED = PROJECTS.filter((p) => p.featured);

export const projectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);

/** Wraps, so the last project's "next" is the first. */
export const nextProject = (slug: string): Project => {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(i + 1) % PROJECTS.length];
};
