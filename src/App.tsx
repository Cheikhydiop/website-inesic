import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Sakkanal from './pages/Sakkanal';
import Expertise from './pages/Expertise';
import Contact from './pages/Contact';
import WhyUs from './pages/WhyUs';
import About from './pages/About';
import AOSInitializer from './components/AOSInitializer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <AOSInitializer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sakkanal" element={<Sakkanal />} />
          <Route path="/expertise" element={<Expertise />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/about" element={<About />} />
          {/* Ajoutez d'autres routes ici */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
