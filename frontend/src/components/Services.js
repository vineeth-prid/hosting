import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Camera, ChefHat } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: 'easeOut' },
  }),
};

const services = [
  {
    icon: Plane,
    title: 'Airport Pickup & Drop',
    desc: 'Seamless transportation from Cochin International Airport to your staycation home. Comfortable, reliable, and on time.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&q=80',
  },
  {
    icon: Camera,
    title: 'Sightseeing Packages',
    desc: 'Explore Fort Kochi, Chinese Fishing Nets, Marine Drive, and more with our curated Kochi sightseeing tours.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
  },
  {
    icon: ChefHat,
    title: 'Homemade Food Experience',
    desc: 'Savor authentic Kerala cuisine prepared by local home chefs. From appam to fish curry, taste the real flavors of Kerala.',
    image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80',
  },
];

export default function Services() {
  return (
    <section id="services" data-testid="services-section" className="section-padding bg-sand-light">
      <div className="container-custom">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="overline-text text-center mb-4">
          Add-On Services
        </motion.p>
        <motion.h2
          data-testid="services-heading"
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
          className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-heading text-center tracking-tight mb-14"
        >
          Enhance Your <span className="italic text-warm-sand">Experience</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              data-testid={`service-card-${i}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              custom={i + 2}
              variants={fadeUp}
              className="group bg-white rounded-2xl overflow-hidden border border-border-sand hover:shadow-xl transition-all duration-500"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-deep-teal/20 group-hover:bg-deep-teal/40 transition-all duration-500" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-xl">
                  <service.icon size={20} className="text-deep-teal" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-medium text-heading mb-2 group-hover:text-warm-sand transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="font-body text-sm text-body-text leading-relaxed">
                  {service.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
