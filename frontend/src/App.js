import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Properties from './components/Properties';
import PropertyDetail from './components/PropertyDetail';
import BookingSection from './components/BookingSection';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Services from './components/Services';
import LocationMap from './components/LocationMap';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

const API = process.env.REACT_APP_BACKEND_URL;

function LandingPage() {
  const [properties, setProperties] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [bookingProperty, setBookingProperty] = useState(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, testRes] = await Promise.all([
          axios.get(`${API}/api/properties`),
          axios.get(`${API}/api/testimonials`),
        ]);
        setProperties(propRes.data);
        setTestimonials(testRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const handleBookNow = (property) => {
    setBookingProperty(property);
    setTimeout(() => {
      const el = document.querySelector('#booking');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="app-wrapper">
      <Navbar />
      <Hero />
      <About />
      <Properties properties={properties} onViewDetails={setSelectedDetail} onBookNow={handleBookNow} />
      <BookingSection properties={properties} selectedProperty={bookingProperty} />
      <WhyChooseUs />
      <Testimonials testimonials={testimonials} />
      <Services />
      <LocationMap />
      <Contact />
      <Footer />
      <WhatsAppButton />
      <AnimatePresence>
        {selectedDetail && (
          <PropertyDetail property={selectedDetail} onClose={() => setSelectedDetail(null)} onBookNow={handleBookNow} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      axios.get(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('admin_token'))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('admin_token');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-sand-light flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-deep-teal border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <AdminLogin onLogin={handleLogin} />;
  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
