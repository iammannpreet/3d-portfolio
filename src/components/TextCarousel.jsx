import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

// Styled container for the rotating text
const CarouselContainer = styled.div`
  position: relative;
  height: 300px; /* Adjust height */
  width: 100%;
  padding-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  perspective: 800px; /* Reduced perspective to bring closer */
  overflow: hidden;

  h1 {
    position: absolute;
    font-size: 4.5rem;
    font-weight: bold;
    color: white;
    transform-origin: center; /* Ensures rotation around the center */
    text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.5); /* Subtle glow effect */
    transition: opacity 1.5s ease-out; /* Smooth opacity transition */
  }
`;

const TextCarousel = ({ items }) => {
    const carouselRef = useRef(null);
    const angle = 360 / items.length;
    const radius = 900;

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
                    const opacity = z > 0 ? 1.4 : 0.8;
                    const scale = z > 1 ? 0.9 : 0.9;

                    // Apply transformations with flipped text
                    item.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${currentAngle}deg) scale(${scale}) scaleX(-1)`;
                    item.style.opacity = opacity;
                });

                rotation += 0.25;
            }
            requestAnimationFrame(rotateCarousel);
        };

        rotateCarousel();
    }, [items, angle, radius]);

    return (
        <CarouselContainer ref={carouselRef}>
            {items.map((item, index) => (
                <h1 key={index}>{item}</h1>
            ))}
        </CarouselContainer>
    );
};

export default TextCarousel;
