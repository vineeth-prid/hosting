import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1920&q=85';

export default function Hero() {
  const scrollToBooking = () => {
    const el = document.querySelector('#booking');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section data-testid="hero-section" className="relative h-screen w-full overflow-hidden">
      <div
        data-testid="hero-bg"
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />

      <div className="video-overlay absolute inset-0" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="overline-text text-warm-sand mb-6"
        >
          Premium Staycation Homes in Kochi
        </motion.p>

        <motion.h1
          data-testid="hero-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-heading text-5xl md:text-6xl lg:text-7xl font-light text-white leading-none tracking-tight max-w-4xl"
        >
          Experience Kochi
          <br />
          <span className="italic font-light text-warm-sand">Like Never Before</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="font-body text-white/80 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed tracking-wide"
        >
          Premium Staycation Homes Near Infopark & Wonderla
        </motion.p>

        <motion.button
          data-testid="hero-book-now"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          onClick={scrollToBooking}
          className="mt-10 bg-white/10 backdrop-blur-md border border-white/30 text-white font-body text-base px-10 py-4 rounded-full hover:bg-white hover:text-deep-teal transition-all duration-500 tracking-wider"
        >
          Book Your Stay
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="text-white/60" size={28} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
