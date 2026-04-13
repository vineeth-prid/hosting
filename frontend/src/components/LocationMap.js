import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: 'easeOut' },
  }),
};

const landmarks = [
  { name: 'Infopark Kochi', distance: '2 min drive' },
  { name: 'Wonderla Amusement Park', distance: '10 min drive' },
  { name: 'Lulu Mall', distance: '15 min drive' },
  { name: 'Fort Kochi', distance: '25 min drive' },
  { name: 'Marine Drive', distance: '20 min drive' },
  { name: 'Cochin International Airport', distance: '35 min drive' },
];

const MAP_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.2!2d76.36!3d10.01!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d08f976f3a9%3A0x5e04b53e9e753f8d!2sInfopark%20Phase%20II%2C%20Kakkanad%2C%20Kochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";

export default function LocationMap() {
  return (
    <section data-testid="location-section" className="section-padding bg-white">
      <div className="container-custom">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="overline-text text-center mb-4">
          Location
        </motion.p>
        <motion.h2
          data-testid="location-heading"
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
          className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-heading text-center tracking-tight mb-14"
        >
          Find <span className="italic text-warm-sand">Us</span>
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}
            className="lg:col-span-8 rounded-2xl overflow-hidden border border-border-sand"
            style={{ filter: 'grayscale(60%) sepia(10%) hue-rotate(150deg)' }}
          >
            <iframe
              data-testid="google-map"
              src={MAP_EMBED}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hosting Location - Behind Infopark Phase 2, Kakkanad, Kochi"
            />
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp}
            className="lg:col-span-4"
          >
            <div className="bg-sand-light rounded-2xl border border-border-sand p-6">
              <h4 className="font-heading text-lg font-medium text-heading mb-1">Our Location</h4>
              <p className="font-body text-sm text-body-text mb-6">
                Behind Infopark Phase 2, Kakkanad, Kochi, Kerala
              </p>
              <h4 className="font-heading text-lg font-medium text-heading mb-4">Nearby Landmarks</h4>
              <div className="space-y-3">
                {landmarks.map((l, i) => (
                  <div key={l.name} data-testid={`landmark-${i}`} className="flex items-center gap-3">
                    <div className="bg-white p-1.5 rounded-lg border border-border-sand shrink-0">
                      <MapPin size={14} className="text-warm-sand" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-heading">{l.name}</p>
                      <p className="font-body text-xs text-body-text">{l.distance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
