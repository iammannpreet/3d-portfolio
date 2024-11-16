import { Html } from '@react-three/drei';
import React from 'react';
import styled, { keyframes } from 'styled-components';
import github from '../assets/icons/github.svg';
import KnowMeButton from './KnowMeButton';
import '../index.css'

// Define keyframe animations
const textRotate1 = keyframes`
  0% { transform: translate3d(0, 0%, 0) rotateX(0deg); }
  40% { transform: translate3d(0, 0%, 0) rotateX(0deg); }
  60% { transform: translate3d(0, -100%, 0) rotateX(-90deg); }
  100% { transform: translate3d(0, -100%, 0) rotateX(-90deg); }
`;

const textRotate2 = keyframes`
  0% { transform: translate3d(0, 100%, 0) rotateX(-90deg); }
  40% { transform: translate3d(0, 100%, 0) rotateX(-90deg); }
  60% { transform: translate3d(0, 0%, 0) rotateX(0deg); }
  100% { transform: translate3d(0, 0%, 0) rotateX(0deg); }
`;

const AnimatedTextContainer = styled.div`
  .text {
    span {
      will-change: transform;
      transform-style: preserve-3d;
      animation: ${textRotate1} 2.4s infinite alternate;
    }
    &.second {
      span {
        transform-origin: bottom;
        transform: translate3d(0, 100%, 0) rotateX(-90deg);
        animation: ${textRotate2} 2.4s infinite alternate;
      }
    }
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

const produceSpans = (text) =>
  text.split("").map((letter, index) => (
    <span key={index} style={{ display: 'inline-block' }}>
      {letter}
    </span>
  ));

const Overlay = ({ onTransformClick }) => {
  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div className="font-bruno h-screen flex flex-col items-center" style={{ pointerEvents: 'none' }}>
    
        <AnimatedTextContainer className="mt-4 relative font-bold text-gray-800 text-center">
          <span
            className="text first w-screen text-2xl md:text-4xl inline-block origin-bottom text-gray-700"
            aria-label="Manpreet Singh"
          >
            {produceSpans("IamMannPreet")}
          </span>
          <span
            className="text second w-screen text-2xl md:text-4xl text-gray-900 absolute top-0 left-0"
            aria-label="Full Stack Developer"
          >
            {produceSpans("Full Stack Developer")}
          </span>
        </AnimatedTextContainer>
        <h1 className="text-center font-sans">📍 Based In Montreal</h1>
        <div style={{ pointerEvents: 'auto' }}>
          <KnowMeButton onClick={onTransformClick}>
            Know me Better
          </KnowMeButton>
        </div>
        {/* Toolbar at the bottom */}

        <div className='flex gap-2 bg-white/20 rounded-lg p-2 shadow-lg shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]' style={{ pointerEvents: 'auto' }}>
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
