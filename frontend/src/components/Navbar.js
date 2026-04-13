import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Properties', href: '#properties' },
  { label: 'Booking', href: '#booking' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      data-testid="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-border-sand'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom flex items-center justify-between h-16 md:h-20">
        <button
          data-testid="navbar-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className={`font-heading text-2xl md:text-3xl font-semibold tracking-tight transition-colors duration-500 ${scrolled ? 'text-deep-teal' : 'text-white'}`}>
            Hosting
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              data-testid={`nav-${link.label.toLowerCase()}`}
              onClick={() => scrollTo(link.href)}
              className={`font-body text-sm tracking-wide transition-colors duration-300 hover:text-warm-sand ${
                scrolled ? 'text-body-text' : 'text-white/90'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            data-testid="nav-book-now"
            onClick={() => scrollTo('#booking')}
            className="bg-deep-teal text-white font-body text-sm px-6 py-2.5 rounded-full hover:bg-teal-hover transition-all duration-300 tracking-wide"
          >
            Book Now
          </button>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden transition-colors ${scrolled ? 'text-deep-teal' : 'text-white'}`}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-border-sand overflow-hidden"
          >
            <div className="container-custom py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                  onClick={() => scrollTo(link.href)}
                  className="font-body text-body-text text-left py-2 hover:text-deep-teal transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <button
                data-testid="mobile-nav-book-now"
                onClick={() => scrollTo('#booking')}
                className="bg-deep-teal text-white font-body text-sm px-6 py-3 rounded-full mt-2 hover:bg-teal-hover transition-all"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
