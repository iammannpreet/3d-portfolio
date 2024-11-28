import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { HelmetCanvas } from './HelmetCanvas';
import { Reflector, Environment } from '@react-three/drei';

function Welcome() {
  const [isNightMode, setIsNightMode] = useState(false); // State to toggle between day/night modes

  const toggleEnvironment = () => {
    setIsNightMode((prevMode) => !prevMode);
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {/* Toggle Button */}
      <button
        onClick={toggleEnvironment}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          background: 'black',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000, // Ensure the button appears above the canvas
        }}
      >
        {isNightMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
      </button>

      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        {/* Environment */}
        <Environment
          files={
            isNightMode
              ? 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/moonless_golf_2k.hdr' // Night mode HDRI
              : 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/evening_road_01_puresky_2k.hdr' // Day mode HDRI
          }
          background // Sets the HDRI as the scene background
        />

        {/* Helmet Canvas */}
        <HelmetCanvas />

        {/* Reflective Floor */}
        <Reflector
          resolution={1440}
          args={[5, 8]} // Plane dimensions
          mirror={isNightMode ? 1 : 0.5} // Night: subtle reflection, Day: stronger reflection
          mixBlur={isNightMode ? 1 : 0.2} // Night: more blur, Day: less blur
          mixStrength={isNightMode ? 1.5 : 2.5} // Night: softer reflection, Day: sharper reflection
          depthScale={isNightMode ? 3.0 : 5.5} // Night: reduced depth, Day: increased depth
          minDepthThreshold={isNightMode ? 0.5 : 0.75} // Night: lower threshold, Day: higher threshold
          maxDepthThreshold={1.0} // Upper depth threshold
          rotation={[-Math.PI / 2.1, 0, 0]} // Rotate to face upwards
          position={[0, -1.5, 3]} // Place below the model
        >
          {(Material, props) => (
            <Material {...props} color="white" metalness={1} roughness={0} />
          )}
        </Reflector>
      </Canvas>
    </div>
  );
}

export default Welcome;
