import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Heart } from 'lucide-react';

const ABOUT_IMG = 'https://images.unsplash.com/photo-1752769041812-d956228c1e81?w=800&q=80';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.15, ease: 'easeOut' },
  }),
};

export default function About() {
  return (
    <section id="about" data-testid="about-section" className="section-padding bg-sand-light">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <motion.div
            className="lg:col-span-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            custom={0}
            variants={fadeUp}
          >
            <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
              <img
                data-testid="about-image"
                src={ABOUT_IMG}
                alt="Tropical villa in Kochi"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-deep-teal/60 to-transparent h-32" />
            </div>
          </motion.div>

          <div className="lg:col-span-7">
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className="overline-text mb-4"
            >
              About Us
            </motion.p>
            <motion.h2
              data-testid="about-heading"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-heading tracking-tight leading-tight"
            >
              Your Home Away
              <br />
              <span className="italic text-warm-sand">From Home</span>
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              variants={fadeUp}
              className="font-body text-body-text text-base md:text-lg leading-relaxed mt-6 max-w-xl"
            >
              Hosting brings you premium, handpicked staycation homes in the heart of Kochi.
              Whether you're here for business at Infopark or leisure at Wonderla, our curated
              properties offer the perfect blend of comfort, style, and authentic Kerala hospitality.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
              {[
                { icon: Heart, title: 'Curated Homes', desc: 'Hand-selected premium properties' },
                { icon: MapPin, title: 'Near Infopark', desc: "Kochi's IT hub at your doorstep" },
                { icon: Briefcase, title: 'Business & Leisure', desc: 'Perfect for every traveler' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  data-testid={`about-card-${i}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={3 + i}
                  variants={fadeUp}
                  className="bg-white rounded-xl p-5 border border-border-sand hover:shadow-lg transition-shadow duration-300"
                >
                  <item.icon className="text-warm-sand mb-3" size={24} strokeWidth={1.5} />
                  <h4 className="font-heading text-lg font-medium text-heading">{item.title}</h4>
                  <p className="font-body text-sm text-body-text mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
