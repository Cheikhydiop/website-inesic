import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Sakkanal from './pages/Sakkanal';
import SakkanalQualification from './pages/SakkanalQualification';
import SakkanalResults from './pages/SakkanalResults';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Expertise from './pages/Expertise';
import Contact from './pages/Contact';
import WhyUs from './pages/WhyUs';
import About from './pages/About';
import AOSInitializer from './components/AOSInitializer';
import { useAnalyticsTracking } from './hooks/useAnalyticsTracking';
import './App.css';

// Composant pour initialiser le tracking
function AnalyticsTracker() {
  useAnalyticsTracking();
  return null;
}

function App() {
  return (
    <Router>
      <div className="App">
        <AOSInitializer />
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sakkanal" element={<Sakkanal />} />
          <Route path="/sakkanal/qualification" element={<SakkanalQualification />} />
          <Route path="/sakkanal/results" element={<SakkanalResults />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          <Route path="/expertise" element={<Expertise />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;