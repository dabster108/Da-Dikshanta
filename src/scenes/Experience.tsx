import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Atmosphere } from "@/atmosphere/Atmosphere";
import { SmoothScrollProvider } from "./SmoothScrollProvider";
import { Nav } from "./Nav";
import { Preloader } from "./Preloader";
import { Cursor } from "@/components/Cursor";
import { LandingScene } from "./LandingScene";
import { StoryScene } from "./StoryScene";
import { ProjectsScene } from "./ProjectsScene";
import { PresenceScene } from "./PresenceScene";
import { ContactScene } from "./ContactScene";

gsap.registerPlugin(ScrollTrigger);

/**
 * The portfolio — one continuous sequence.
 *
 * The visitor scrolls once and the environment transforms around them:
 * landing → story → projects → presence → contact. No routes, no page
 * breaks, no disconnected containers. The atmosphere layer is fixed behind
 * everything; the scenes float over it.
 *
 * A preloader plays on first mount, then lifts away to reveal the
 * experience. The atmosphere mounts behind the preloader so the handoff
 * is seamless. When the preloader finishes we call ScrollTrigger.refresh()
 * once — the scenes' ScrollTriggers were created while the preloader was
 * up, and a single refresh after the DOM settles guarantees their
 * measurements are current.
 */
export const Experience = () => {
  const [booting, setBooting] = useState(true);
  const [activeScene, setActiveScene] = useState(0);

  // Prevent scroll restoration from dropping the visitor mid-page on reload.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Scene index for 3D background morphing.
  useEffect(() => {
    if (booting) return;
    const ids = ["landing", "story", "projects", "presence", "contact"];
    const sections = ids
      .map((id) => document.querySelector<HTMLElement>(`[data-scene="${id}"]`))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).dataset.scene;
          const idx = id ? ids.indexOf(id) : -1;
          if (idx >= 0) setActiveScene(idx);
        });
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: 0.01 },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [booting]);

  // After the preloader lifts, refresh once so any ScrollTrigger created
  // during preload has fresh measurements. Deferred two frames so the
  // preloader's unmount transition has committed.
  useEffect(() => {
    if (booting) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [booting]);

  return (
    <SmoothScrollProvider>
      <Atmosphere activeScene={activeScene} />
      {booting && <Preloader onDone={() => setBooting(false)} />}
      <Cursor />
      <Nav />
      <main className="relative z-10">
        <LandingScene heroReady={!booting} />
        <StoryScene />
        <ProjectsScene />
        <PresenceScene />
        <ContactScene />
      </main>
    </SmoothScrollProvider>
  );
};
