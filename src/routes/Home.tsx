import { Nav } from "@/components/navigation/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Research } from "@/components/sections/Research";
import { Capability } from "@/components/sections/Capability";
import { Work } from "@/components/sections/Work";
import { Lab } from "@/components/sections/Lab";
import { Timeline } from "@/components/sections/Timeline";
import { Contact } from "@/components/sections/Contact";

/**
 * The homepage — one continuous scroll, divided into chapters.
 *
 * Each chapter carries `data-chapter`, which is what ScrollController binds
 * its ground-colour crossfade and chapter tracking to. The order here must
 * match `data/chapters.ts`; if the two drift, the background will fade
 * toward the wrong colour and the nav readout will lie.
 *
 * Reading order: opening → how I think → what I'm asking → what I can build
 * → what I've built → what I've taken apart → how I got here → how to reach
 * me (§60).
 */
const Home = ({ ready }: { ready: boolean }) => (
  <>
    <Nav />
    <main className="relative z-content">
      <Hero ready={ready} />
      <About />
      <Research />
      <Capability />
      <Work />
      <Lab />
      <Timeline />
      <Contact />
    </main>
  </>
);

export default Home;
