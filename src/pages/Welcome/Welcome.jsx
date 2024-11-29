import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { HelmetCanvas } from './HelmetCanvas';
import { Reflector, Environment } from '@react-three/drei';
import KnowMeButton from '../../components/KnowMeButton';
import TextCarousel from '../../components/TextCarousel';

function Welcome() {
  const [isNightMode, setIsNightMode] = useState(false);
  const items = [
    'NextJS',
    'ReactJS',
    'TailwindCSS',
    'NodeJS',
    'MongoDB',
    'SQL',
    'ReactThreeFiber',
    'JavaScript',
    'ExpressJS',
    'GraphQL',
    'REST APIs',
    'HTML5',
    'CSS3',
    'TypeScript',
    'Three.js',
    'Redux',
    'Git',
    'Firebase',
    'Docker',
    'PostgreSQL',
    'Supabase',
    'Vite',
  ];


  const toggleEnvironment = () => {
    setIsNightMode((prevMode) => !prevMode);
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Toggle Button */}
      <div style={{ position: 'absolute', top: '80px', left: '20px', zIndex: 1000 }}>
        <KnowMeButton
          className="min-w-[5rem]"
          onClick={toggleEnvironment}
        >
          {isNightMode ? 'Light' : 'Dark'}
        </KnowMeButton>

      </div>

      {/* Rotating 3D Text Carousel */}
      <div style={{ position: 'absolute', zIndex: 10 }}>
        <TextCarousel items={items} />
      </div>

      {/* Canvas */}
      <Canvas camera={{ position: [0, 1, 8], fov: 50 }}>
        <Environment
          files={
            isNightMode
              ? 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonless_golf_1k.hdr'
              : 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/evening_road_01_puresky_1k.hdr'
          }
          background={!isNightMode}
        />
        <HelmetCanvas />
        <Reflector
          resolution={1024}
          args={[5, 8]}
          mirror={isNightMode ? 0.7 : 0.4}
          mixBlur={isNightMode ? 1 : 0.2}
          mixStrength={isNightMode ? 1.2 : 2.2}
          depthScale={isNightMode ? 2.5 : 4.5}
          minDepthThreshold={isNightMode ? 0.5 : 0.7}
          maxDepthThreshold={1.0}
          rotation={[-Math.PI / 2.1, 0, 0]}
          position={[0, -1.5, 3]}
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
