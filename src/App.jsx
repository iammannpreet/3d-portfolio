import React from 'react'
import { useState } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'

function App() {
  return (
    <div>
      <Canvas>
        <Experience></Experience>
      </Canvas>
    </div>

  )
}

export default App