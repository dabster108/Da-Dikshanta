import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface RobotLottieProps {
  path?: string; // URL to the lottie json (defaults to /images/robot.json)
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

const RobotLottie: React.FC<RobotLottieProps> = ({
  path = "/images/robot.json",
  loop = true,
  autoplay = true,
  className,
}) => {
  const [animationData, setAnimationData] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    // fetch the json from the public path and store it as animationData
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load animation: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (mounted) setAnimationData(data);
      })
      .catch((err) => {
        // keep a console warning but don't break the UI
        // eslint-disable-next-line no-console
        console.warn("RobotLottie: could not load animation", err);
      });

    return () => {
      mounted = false;
    };
  }, [path]);

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        width: 140,
        height: 140,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0.95,
      }}
    >
      {animationData ? (
        <Lottie
          loop={loop}
          animationData={animationData}
          autoplay={autoplay}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </div>
  );
};

export default RobotLottie;
