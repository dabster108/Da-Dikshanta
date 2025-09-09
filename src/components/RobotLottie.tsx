import React from "react";
import Lottie from "lottie-react";

const RobotLottie: React.FC = () => {
  return (
    <div style={{
      position: "fixed",
      right: 16,
      bottom: 16,
      width: 140,
      height: 140,
      zIndex: 9999,
      pointerEvents: "none",
      opacity: 0.95,
    }}>
      <Lottie
        loop={true}
        animationData={undefined}
        path="/images/robot.json"
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default RobotLottie;
