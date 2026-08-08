import { Suspense, lazy, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ScrollController } from "@/lib/animation/ScrollController";
import { Cursor } from "@/components/cursor/Cursor";
import { Boot } from "@/components/layout/Boot";
import Home from "@/routes/Home";
import ProjectPage from "@/routes/ProjectPage";
import NotFound from "@/routes/NotFound";

/**
 * The shell.
 *
 * One WebGL context lives here, above the router, so navigating to a project
 * page does not tear down and rebuild the scene — the 3D layer is continuous
 * across the whole visit, which is what makes a route change feel like a
 * camera move rather than a page load (§42).
 *
 * The scene is a lazy chunk: the document is readable before three.js has
 * finished parsing, and a device that can't run it still gets everything
 * that matters.
 */

const Scene = lazy(() => import("@/components/3d/Scene"));

const App = () => {
  const [sceneReady, setSceneReady] = useState(false);
  const [booted, setBooted] = useState(false);

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ScrollController>
          {/* If WebGL fails, the boundary drops the canvas and the document
              carries on — the 3D is atmosphere, never the content. */}
          <ErrorBoundary fallback={null} onError={() => setSceneReady(true)}>
            <Suspense fallback={null}>
              <Scene onReady={() => setSceneReady(true)} />
            </Suspense>
          </ErrorBoundary>

          <Cursor />

          {!booted && <Boot sceneReady={sceneReady} onDone={() => setBooted(true)} />}

          <Routes>
            <Route path="/" element={<Home ready={booted} />} />
            <Route path="/work/:slug" element={<ProjectPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ScrollController>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
