import { Html } from '@react-three/drei';
import React from 'react';
import styled, { keyframes } from 'styled-components';
import github from '../assets/icons/github.svg';
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

const produceSpans = (text) =>
  text.split("").map((letter, index) => (
    <span key={index} style={{ display: 'inline-block' }}>
      {letter}
    </span>
  ));

const Overlay = ({ onTransformClick }) => {
  return (
    <Html fullscreen>
      <div className="font-bruno h-screen">

        <AnimatedTextContainer className='mt-4 relative font-bold text-gray-800 text-center'>
          <span className="text first w-screen text-2xl md:text-4xl inline-block origin-bottom text-gray-700" aria-label="Manpreet Singh">
            {produceSpans("IamMannPreet")}
          </span>
          <span className="text second  w-screen text-2xl md:text-4xl text-gray-900 absolute top-0 left-0" aria-label="Full Stack Developer">
            {produceSpans("Full Stack Developer")}
          </span>
        </AnimatedTextContainer>

        <button className='px-4 py-2 text-base cursor-pointer rounded bg-gray-700 text-white border-none mt-8 transition-colors duration-300 ease-in-out hover:bg-black' onClick={onTransformClick}>
          Know me Better
        </button>

        <img className='w-12 bg-transparent drop-shadow-glow' src={github} alt="GitHub" />

      </div>
    </Html>
  );
};

export default Overlay;
