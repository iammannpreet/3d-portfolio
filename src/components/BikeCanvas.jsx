import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import Bike from "./Bike";

const BikeCanvas = () => {
  const [background, setBackground] = useState({
    color: "#000000",
    gradient: "linear-gradient(10deg, #020224 -10%, #ffffff 50%, #7a7b81 100%)",
  });

  const handleRotationStart = () => {
    setBackground({
      color: "#1a1a1a",
      gradient: "linear-gradient(90deg, #1a1a1a, #4f4f50, #e2e2e2)",
    });
  };

  const handleRotationEnd = () => {
    setBackground({
      color: "#000000",
      gradient: "linear-gradient(10deg, #020224 -10%, #ffffff 50%, #7a7b81 100%)",
    });
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: background.color,
        backgroundImage: background.gradient,
      }}
    >
      <Canvas camera={{ near: 0.1, far: 1000 }}>
        <Suspense fallback={null}>
          <directionalLight position={[5, 5, 5]} intensity={3} />
          <ambientLight intensity={1.3} />
          <Bike />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            onStart={handleRotationStart} // Triggered when rotation starts
            onEnd={handleRotationEnd} // Triggered when rotation ends
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BikeCanvas;
