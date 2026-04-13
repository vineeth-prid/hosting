import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Wifi, Wind, UtensilsCrossed, Car, Tv, Star, Users } from 'lucide-react';

const amenityIcons = {
  WiFi: Wifi,
  AC: Wind,
  Kitchen: UtensilsCrossed,
  Parking: Car,
  TV: Tv,
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: 'easeOut' },
  }),
};

function PropertyImageCarousel({ images, name }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  return (
    <div className="relative overflow-hidden rounded-t-2xl group">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((img, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img}
                  alt={`${name} - ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        data-testid="carousel-prev"
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
      >
        <ChevronLeft size={18} className="text-deep-teal" />
      </button>
      <button
        data-testid="carousel-next"
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
      >
        <ChevronRight size={18} className="text-deep-teal" />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === selectedIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PropertyCard({ property, index, onViewDetails, onBookNow }) {
  return (
    <motion.div
      data-testid={`property-card-${index}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      custom={index}
      variants={fadeUp}
      className="bg-white rounded-2xl overflow-hidden border border-border-sand hover:shadow-xl transition-shadow duration-500"
    >
      <PropertyImageCarousel images={property.images} name={property.name} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading text-xl md:text-2xl font-medium text-heading">{property.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="text-warm-sand fill-warm-sand" size={16} />
            <span className="font-body text-sm font-medium text-heading">{property.rating}</span>
            <span className="font-body text-xs text-body-text">({property.reviews_count})</span>
          </div>
        </div>
        <p className="font-body text-sm text-body-text mb-4">{property.location}</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {property.amenities.slice(0, 5).map((amenity) => {
            const Icon = amenityIcons[amenity] || Wifi;
            return (
              <span key={amenity} className="flex items-center gap-1.5 bg-sand-light text-body-text text-xs font-body px-3 py-1.5 rounded-full">
                <Icon size={12} />
                {amenity}
              </span>
            );
          })}
          {property.amenities.length > 5 && (
            <span className="bg-sand-light text-body-text text-xs font-body px-3 py-1.5 rounded-full">
              +{property.amenities.length - 5} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={14} className="text-body-text" />
          <span className="font-body text-xs text-body-text">Up to {property.max_guests} guests</span>
        </div>
        <div className="flex items-end justify-between mt-4 pt-4 border-t border-border-sand">
          <div>
            <span className="font-heading text-2xl font-semibold text-heading">
              &#8377;{property.price_per_night.toLocaleString()}
            </span>
            <span className="font-body text-sm text-body-text ml-1">/ night</span>
          </div>
          <div className="flex gap-2">
            <button
              data-testid={`view-details-${index}`}
              onClick={() => onViewDetails(property)}
              className="font-body text-sm text-deep-teal border border-deep-teal px-4 py-2 rounded-full hover:bg-deep-teal hover:text-white transition-all duration-300"
            >
              View Details
            </button>
            <button
              data-testid={`book-now-${index}`}
              onClick={() => onBookNow(property)}
              className="font-body text-sm bg-deep-teal text-white px-5 py-2 rounded-full hover:bg-teal-hover transition-all duration-300"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Properties({ properties, onViewDetails, onBookNow }) {
  return (
    <section id="properties" data-testid="properties-section" className="section-padding bg-white">
      <div className="container-custom">
        <motion.p
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
          className="overline-text text-center mb-4"
        >
          Our Properties
        </motion.p>
        <motion.h2
          data-testid="properties-heading"
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
          className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-heading text-center tracking-tight"
        >
          Featured <span className="italic text-warm-sand">Stays</span>
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}
          className="font-body text-body-text text-center mt-4 mb-14 max-w-xl mx-auto"
        >
          Handpicked properties that offer the perfect blend of luxury and comfort
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {properties.map((property, i) => (
            <PropertyCard
              key={property.property_id}
              property={property}
              index={i}
              onViewDetails={onViewDetails}
              onBookNow={onBookNow}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
