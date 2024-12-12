import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { HelmetCanvas } from './HelmetCanvas';
import { Reflector, Environment } from '@react-three/drei';
import KnowMeButton from '../../components/KnowMeButton';
import TextCarousel from '../../components/TextCarousel';
import { gsap } from 'gsap';

function Welcome() {
  const [isNightMode, setIsNightMode] = useState(false);
  const canvasRef = useRef(null);

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
    'VSCODE',
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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let stars = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Star {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.alpha = Math.random() * 0.5 + 0.1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }
      }
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < 100; i++) {
        stars.push(new Star());
      }
    }

    function animateStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.update();
        star.draw();
      });
      requestAnimationFrame(animateStars);
    }

    if (isNightMode) {
      createStars();
      animateStars();

      // Shooting stars effect
      const tl = gsap.timeline({ repeat: -1 });
      tl.to({}, { duration: 2 });
      tl.add(() => {
        const star = new Star();
        star.size = 1;
        gsap.to(star, {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          alpha: 0,
          duration: 0.5,
          onComplete: () => (star.alpha = 0),
        });
        stars.push(star);
      }, '<');
    }
  }, [isNightMode]);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Canvas for Shooting Stars (Background Layer) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1, // Ensure this stays behind the 3D model
          pointerEvents: 'none',
        }}
      />

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

      {/* Canvas for 3D Model (Foreground Layer) */}
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
