import { Html } from '@react-three/drei';
import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import github from '../assets/icons/github.svg';
import KnowMeButton from './KnowMeButton';
import '../index.css';

// Styled container for the rotating text
const CarouselContainer = styled.div`
  position: relative;
  height: 300px; /* Adjust height */
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  perspective: 1000px; /* Ensures a 3D perspective */
  overflow: hidden;

  h1 {
    position: absolute;
    font-size: 3rem; /* Adjust font size */
    font-weight: bold;
    color: white;
    transform-origin: center; /* Ensures rotation around the center */
    transform-style: preserve-3d;
    text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.5); /* Subtle glow effect */
    transition: opacity 0.5s ease-out; /* Smooth opacity transition */
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: visible;
  position: relative;
  pointer-events: auto;

  &:before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 25px);
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 10;
  }

  &:hover:before {
    opacity: 1;
    visibility: visible;
  }

  img {
    transform-origin: bottom center;
    transition: transform 0.3s ease;
  }

  &:hover {
    img {
      transform: scale(1.5) translateY(-20%);
    }
  }
`;

const Overlay = ({ onTransformClick }) => {
  const carouselRef = useRef(null);
  const items = [
    'NextJS',
    'ReactJS',
    'TailwindCSS',
    'NodeJS',
    'MongoDB',
    'SQL',
    'ReactThreeFiber',
  ];
  const angle = 360 / items.length; // Distribute items evenly
  const radius = 1000; // Radius of the carousel

  useEffect(() => {
    let rotation = 0;

    const rotateCarousel = () => {
      if (carouselRef.current) {
        items.forEach((_, index) => {
          const item = carouselRef.current.children[index];
          const currentAngle = (rotation + index * angle) % 360;
          const radians = (currentAngle * Math.PI) / 180;

          // Calculate positions
          const x = Math.sin(radians) * radius;
          const z = Math.cos(radians) * radius;

          // Adjust opacity and scale
          const opacity = z > 0.8 ? 1.4 : 0.8;
          const scale = z > 0 ? 0.7 : 1;

          // Apply transformations with flipped text
          item.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${currentAngle}deg) scale(${scale}) scaleX(-1)`;
          item.style.opacity = opacity;
        });

        rotation += 0.08; // Adjust rotation speed
      }
      requestAnimationFrame(rotateCarousel);
    };

    rotateCarousel();
  }, [items, angle, radius]);

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div
        className="font-bruno flex flex-col items-center w-[100%] h-[100vh] text-center overflow-hidden relative justify-between pb-16"
        style={{ pointerEvents: 'none' }}
      >
        {/* Rotating 3D Text */}
        <CarouselContainer ref={carouselRef}>
          {items.map((item, index) => (
            <h1 key={index}>{item}</h1>
          ))}
        </CarouselContainer>

        <h1 className="text-center font-sans mt-10">📍 Based In Montreal</h1>

        {/* Know Me Button */}
        <div style={{ pointerEvents: 'auto' }}>
          <KnowMeButton onClick={onTransformClick}>Know me Better</KnowMeButton>
        </div>

        {/* Toolbar at the bottom */}
        <div
          className="flex gap-2 bg-white/20 rounded-lg p-2 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
          style={{ pointerEvents: 'auto' }}
        >
          <IconWrapper data-tooltip="GitHub">
            <img className="w-8 hover:drop-shadow-glow" src={github} alt="GitHub" />
          </IconWrapper>
          <IconWrapper data-tooltip="LinkedIn">
            <img className="w-8 hover:drop-shadow-glow" src={github} alt="Experience" />
          </IconWrapper>
          <IconWrapper data-tooltip="Gmail">
            <img className="w-8 hover:drop-shadow-glow" src={github} alt="Skills" />
          </IconWrapper>
          <IconWrapper data-tooltip="Contact">
            <img className="w-8 hover:drop-shadow-glow" src={github} alt="Contact" />
          </IconWrapper>
        </div>
      </div>
    </Html>
  );
};

export default Overlay;
