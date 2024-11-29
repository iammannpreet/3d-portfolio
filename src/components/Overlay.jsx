import React from 'react';
import { Html } from '@react-three/drei';
import styled from 'styled-components';
import github from '../assets/icons/github.svg';
import KnowMeButton from './KnowMeButton';
import TextCarousel from './TextCarousel';
import '../index.css';

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
  const items = [
    'NextJS',
    'ReactJS',
    'TailwindCSS',
    'NodeJS',
    'MongoDB',
    'SQL',
    'ReactThreeFiber',
  ];

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
        <KnowMeButton onClick={onTransformClick}>Know me Better</KnowMeButton>
      </div>
      <div
        className="font-bruno flex flex-col items-center w-[100%] h-[100vh] text-center overflow-hidden relative justify-between pb-16"
        style={{ pointerEvents: 'none' }}
      >
        {/* Rotating 3D Text Carousel */}
        <TextCarousel items={items} radius={1000} speed={0.08} />





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
