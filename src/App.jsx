import React from 'react'
import { useState } from 'react'
import './App.css'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'

function App() {
  return (

    <Canvas>
      <Experience />
    </Canvas>


  )
}

export default App