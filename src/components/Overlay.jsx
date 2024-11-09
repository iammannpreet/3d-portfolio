import { Html } from '@react-three/drei';
import React from 'react';
import styled, { keyframes } from 'styled-components';

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

// Styled components
const OverlayContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  height: 100vh;
  padding: 2rem;
`;

const StyledButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
  background-color: #333;
  color: #fff;
  border: none;
  margin-top: 2rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: black;
  }
`;

const AnimatedTextContainer = styled.div`
  position: relative;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  .text {
    span {
      display: inline-block;
      will-change: transform;
      transform-style: preserve-3d;
      transform-origin: bottom;
      animation: ${textRotate1} 2.4s infinite alternate;
    }
    &.second {
      color: #555; /* Adjust the color for the second text */
      position: absolute;
      top: 0;
      left: 0;
      span {
        transform-origin: bottom;
        transform: translate3d(0, 100%, 0) rotateX(-90deg);
        animation: ${textRotate2} 2.4s infinite alternate;
      }
    }
  }
`;

// Helper function to wrap each letter in a span
const produceSpans = (text) =>
    text.split("").map((letter, index) => (
        <span key={index} style={{ display: 'inline-block' }}>
            {letter}
        </span>
    ));

// Overlay component
const Overlay = ({ onTransformClick }) => {
    return (
        <Html fullscreen>
            <OverlayContainer className="font-bruno">
                <AnimatedTextContainer>
                    <div className="text first w-screen" aria-label="Manpreet Singh">
                        {produceSpans("Iam-Mann")}
                    </div>
                    <div className="text second  w-screen" aria-label="Full Stack Developer">
                        {produceSpans("Full Stack Developer")}
                    </div>
                </AnimatedTextContainer>

                <StyledButton onClick={onTransformClick}>
                    Know me Better
                </StyledButton>
            </OverlayContainer>
        </Html>
    );
};

export default Overlay;
