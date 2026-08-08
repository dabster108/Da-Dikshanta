import { Link } from "react-router-dom";
import { Nav } from "@/components/navigation/Nav";

const NotFound = () => (
  <>
    <Nav variant="project" />
    <main className="relative z-content grid min-h-[100svh] place-items-center px-gutter">
      <div>
        <p className="t-mono">Error 404</p>
        <h1 className="serif mt-6 text-[clamp(2.5rem,8vw,6rem)]">
          No such page.
        </h1>
        <Link
          to="/"
          className="t-mono mt-8 inline-block no-underline transition-colors hover:text-[rgb(var(--lime))]"
        >
          ← Back to the index
        </Link>
      </div>
    </main>
  </>
);

export default NotFound;
