import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: 'easeOut' },
  }),
};

export default function Testimonials({ testimonials }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  if (!testimonials.length) return null;

  return (
    <section data-testid="testimonials-section" className="section-padding bg-deep-teal relative overflow-hidden">
      <div className="absolute top-10 left-10 opacity-5">
        <Quote size={200} className="text-white" />
      </div>

      <div className="container-custom relative z-10">
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="overline-text text-center mb-4 text-warm-sand">
          Testimonials
        </motion.p>
        <motion.h2
          data-testid="testimonials-heading"
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
          className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-white text-center tracking-tight mb-14"
        >
          What Our <span className="italic text-warm-sand">Guests Say</span>
        </motion.h2>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}
          className="max-w-3xl mx-auto"
        >
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {testimonials.map((t, i) => (
                <div key={t.testimonial_id || i} className="flex-[0_0_100%] min-w-0 px-4">
                  <div className="text-center py-4">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-6 border-2 border-warm-sand/30"
                      loading="lazy"
                    />
                    <div className="flex justify-center gap-1 mb-6">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="text-warm-sand fill-warm-sand" size={16} />
                      ))}
                    </div>
                    <blockquote className="font-heading text-xl md:text-2xl text-white/90 font-light italic leading-relaxed max-w-2xl mx-auto">
                      "{t.quote}"
                    </blockquote>
                    <p className="font-body text-white font-medium mt-6 tracking-wide">{t.name}</p>
                    <p className="font-body text-white/50 text-sm">{t.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              data-testid="testimonial-prev"
              onClick={scrollPrev}
              className="bg-white/10 backdrop-blur-sm p-2.5 rounded-full hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === selectedIndex ? 'bg-warm-sand w-6' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button
              data-testid="testimonial-next"
              onClick={scrollNext}
              className="bg-white/10 backdrop-blur-sm p-2.5 rounded-full hover:bg-white/20 transition-all"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
