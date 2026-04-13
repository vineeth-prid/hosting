import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Sparkles, Palmtree } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: 'easeOut' },
  }),
};

const features = [
  {
    icon: MapPin,
    title: 'Prime Location',
    desc: 'Steps away from Infopark IT hub & Wonderla amusement park. The best of Kochi at your doorstep.',
    span: 'md:col-span-7',
  },
  {
    icon: Home,
    title: 'Perfect Staycation Homes',
    desc: 'Handpicked, fully-furnished properties designed for comfort and style.',
    span: 'md:col-span-5',
  },
  {
    icon: Sparkles,
    title: 'Clean & Hygienic',
    desc: 'Professional housekeeping ensures spotless, sanitized spaces for your stay.',
    span: 'md:col-span-5',
  },
  {
    icon: Palmtree,
    title: 'Local Experience',
    desc: 'Immerse yourself in authentic Kerala culture, food, and hospitality.',
    span: 'md:col-span-7',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" data-testid="why-choose-section" className="section-padding bg-white">
      <div className="container-custom">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="overline-text text-center mb-4">
          Why Hosting
        </motion.p>
        <motion.h2
          data-testid="why-choose-heading"
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
          className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-heading text-center tracking-tight mb-14"
        >
          Why Choose <span className="italic text-warm-sand">Us</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              data-testid={`why-card-${i}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              custom={i + 2}
              variants={fadeUp}
              className={`${feature.span} bg-sand-light border border-border-sand rounded-2xl p-7 md:p-8 group hover:bg-deep-teal transition-all duration-500 cursor-default`}
            >
              <feature.icon
                className="text-warm-sand group-hover:text-white/80 mb-5 transition-colors duration-500"
                size={32}
                strokeWidth={1.5}
              />
              <h3 className="font-heading text-xl md:text-2xl font-medium text-heading group-hover:text-white transition-colors duration-500 mb-3">
                {feature.title}
              </h3>
              <p className="font-body text-sm md:text-base text-body-text group-hover:text-white/70 transition-colors duration-500 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
