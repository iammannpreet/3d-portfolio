import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from '../components/Experience'
function Welcome() {
  return (
    <div>
      <Canvas>
        <Experience></Experience>
      </Canvas>
    </div>
  )
}

export default Welcome
