import React from 'react'
import {
    AnimatedSpan,
    DogContainer,
    HomeWrapper,
    Name,
    Position,
    TextContainer,
  } from "./Welcome.styled";
  const produceSpans = (name) => {
    return name.split("").map((letter, index) => (
      <AnimatedSpan
        index={index}
        letter={letter}
        aria-hidden="true"
        key={index}
      >
        {letter}
      </AnimatedSpan>
    ));
  };

function AnimatedText() {
  return (
    <div>
      <TextContainer>
        <Name >Manpreet Singh</Name>
        <Position>
          <div className="text first" aria-label="Full Stack Developer">
            {produceSpans("Full Stack Developer")}
          </div>
          <div className="text second" aria-label="UI/UX Enthusiast">
            {produceSpans("UI/UX Enthusiast")}
          </div>
        </Position>
        </TextContainer>
    </div>
  )
}

export default AnimatedText
