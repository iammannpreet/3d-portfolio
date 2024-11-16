import React from 'react'
import { Canvas } from '@react-three/fiber'
import { HelmetCanvas } from '../components/HelmetCanvas'
function Welcome() {
  return (
    <div>
      <Canvas>
        <HelmetCanvas />
      </Canvas>
    </div>
  )
}

export default Welcome
