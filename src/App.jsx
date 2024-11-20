import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Welcome from './pages/Welcome/Welcome'
import Portfolio from './pages/Portfolio';


function App() {
  return (
<Router>
  <Routes>
  <Route path="/" element={<Welcome />} />
  <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
      </Router>

  )
}

export default App