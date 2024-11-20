import React from 'react'
import { Canvas } from '@react-three/fiber'
import { HelmetCanvas } from './HelmetCanvas'
function Welcome() {
  return (
    <div>
        <Canvas>
        <HelmetCanvas></HelmetCanvas>
      </Canvas>
      
    </div>
  )
}

export default Welcome
